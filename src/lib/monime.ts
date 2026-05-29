import { randomUUID } from 'crypto';

// Environment variables
const MONIME_ACCESS_TOKEN = process.env.MONIME_API_KEY!;
const MONIME_SPACE_ID = process.env.MONIME_SPACE_ID!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Type definitions following Monime API documentation
export type LineItem = {
  type: 'custom';
  name: string;
  price: { currency: 'SLE'; value: number };
  quantity: number;
  description?: string;
  reference?: string;
};

export interface CreateCheckoutSessionParams {
  name: string;
  orderId: string;
  lineItems: LineItem[];
  metadata?: Record<string, string>;
  callbackState?: string;
}

export interface CheckoutSessionResponse {
  redirectUrl: string;
  sessionId: string;
}

export interface CheckoutSessionStatus {
  id: string;
  status: string;
  reference?: string;
}

// Helper function to convert SLE to minor units (cents)
export function toMinorUnits(amountSLE: number): number {
  return Math.round(amountSLE * 100);
}

// Create a hosted checkout session on Monime
export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResponse> {
  // Check if we're in test mode
  const isTestMode = MONIME_ACCESS_TOKEN?.includes("test") ||
                     process.env.NODE_ENV === "development";

  if (isTestMode) {
    // Return mock response for testing
    console.log("🧪 MONIME TEST MODE: Simulating checkout session creation");
    console.log("Order ID:", params.orderId);
    console.log("Line items:", params.lineItems.length);

    const mockSessionId = `test_session_${params.orderId.slice(-8)}`;

    // In test mode, redirect directly to success verification
    const successUrl = `${APP_URL}/api/checkout/success?orderId=${encodeURIComponent(params.orderId)}&sid=${mockSessionId}`;

    return {
      redirectUrl: successUrl,
      sessionId: mockSessionId
    };
  }

  // Build redirect URLs on the server to prevent tampering
  const successUrl = `${APP_URL}/api/checkout/success?orderId=${encodeURIComponent(params.orderId)}`;
  const cancelUrl = `${APP_URL}/checkout?cancelled=true&orderId=${encodeURIComponent(params.orderId)}`;

  const response = await fetch('https://api.monime.io/v1/checkout-sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MONIME_ACCESS_TOKEN}`,
      'Monime-Space-Id': MONIME_SPACE_ID,
      'Idempotency-Key': randomUUID(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: params.name,
      successUrl,
      cancelUrl,
      lineItems: params.lineItems,
      metadata: params.metadata,
      callbackState: params.callbackState,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Monime checkout session creation failed:', error);
    throw new Error(`Failed to create checkout session: ${error}`);
  }

  const data = await response.json();

  if (!data?.result?.redirectUrl || !data?.result?.id) {
    throw new Error('Invalid response from Monime API');
  }

  return {
    redirectUrl: data.result.redirectUrl,
    sessionId: data.result.id
  };
}

// Retrieve a checkout session to verify its status
export async function getCheckoutSession(sessionId: string): Promise<CheckoutSessionStatus> {
  // Check if we're in test mode
  const isTestMode = MONIME_ACCESS_TOKEN?.includes("test") ||
                     process.env.NODE_ENV === "development";

  if (isTestMode) {
    // Return mock response for testing
    console.log("🧪 MONIME TEST MODE: Simulating session verification");
    console.log("Session ID:", sessionId);

    return {
      id: sessionId,
      status: "completed", // Simulate successful payment
      reference: undefined // Let verification API handle test mode differently
    };
  }

  const response = await fetch(`https://api.monime.io/v1/checkout-sessions/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${MONIME_ACCESS_TOKEN}`,
      'Monime-Space-Id': MONIME_SPACE_ID,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Monime session verification failed:', error);
    throw new Error(`Failed to get checkout session: ${error}`);
  }

  const data = await response.json();

  if (!data?.result) {
    throw new Error('Invalid response from Monime API');
  }

  return {
    id: data.result.id,
    status: data.result.status,
    reference: data.result.reference
  };
}

// Process payment using Monime (for direct integration)
export async function processPaymentWithMonime(paymentData: {
  orderId: string;
  amount: number; // SLE minor units
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  bankCode: string;
}) {
  // Check if we're in test mode
  const isTestMode = MONIME_ACCESS_TOKEN?.includes("test") ||
                     process.env.NODE_ENV === "development";

  if (isTestMode) {
    console.log("🧪 MONIME TEST MODE: Simulating payment processing");
    console.log("Order ID:", paymentData.orderId);
    console.log("Amount:", paymentData.amount, "SLE minor units");

    // Simulate payment processing with delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate decline for test card 1234567890123456
    if (paymentData.cardNumber === "1234567890123456") {
      throw new Error("Payment declined: Insufficient funds");
    }

    // Simulate success for other test cards
    return {
      success: true,
      transactionId: `test_txn_${paymentData.orderId.slice(-8)}`,
      reference: paymentData.orderId,
      amount: paymentData.amount,
    };
  }

  // For production, implement actual Monime payment API call
  // This would typically be done through Monime's payment processing endpoint
  throw new Error("Direct payment processing not implemented - use hosted checkout instead");
}

// Convert cart items to Monime line items format
export function convertToMonimeLineItems(cartItems: Array<{
  product: { name: string };
  variant: { size: string };
  quantity: number;
  price: number; // SLE minor units
}>): LineItem[] {
  return cartItems.map((item, index) => ({
    type: 'custom' as const,
    name: `${item.product.name} (${item.variant.size})`,
    price: {
      currency: 'SLE' as const,
      value: item.price // Already in minor units
    },
    quantity: item.quantity,
    description: `Size: ${item.variant.size}`,
    reference: `item_${index + 1}`
  }));
}

// Helper to format line items for display
export function formatLineItemsDisplay(lineItems: LineItem[]): string {
  return lineItems.map(item =>
    `${item.name} × ${item.quantity} = ${(item.price.value * item.quantity / 100).toFixed(2)} SLE`
  ).join(', ');
}