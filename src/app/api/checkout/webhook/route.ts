import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { confirmReservation, releaseReservation } from "@/lib/stock-reservation";

// Webhook event types from Monime
type WebhookEventType =
  | "checkout.session.completed"
  | "checkout.session.expired"
  | "checkout.session.cancelled";

interface MonimeWebhookPayload {
  id: string;
  object: "event";
  type: WebhookEventType;
  data: {
    object: {
      id: string; // session ID
      status: "completed" | "expired" | "cancelled";
      reference?: string; // order ID
      amount_total: number;
      currency: string;
      created: number;
    };
  };
}

/**
 * Webhook endpoint for Monime payment status updates
 * Handles automatic payment verification and order processing
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const webhookHeaders = await headers();

    // 1. Verify webhook signature (if Monime provides signature verification)
    const signature = webhookHeaders.get("monime-signature");
    if (!verifyWebhookSignature(payload, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // 2. Parse webhook payload
    const event: MonimeWebhookPayload = JSON.parse(payload);

    // 3. Log webhook event for monitoring
    console.log(`Received Monime webhook: ${event.type} for session ${event.data.object.id}`);

    // 4. Process based on event type
    const result = await processWebhookEvent(event);

    return NextResponse.json({
      received: true,
      processed: result.success,
      message: result.message,
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Process different types of webhook events
 */
async function processWebhookEvent(event: MonimeWebhookPayload): Promise<{
  success: boolean;
  message: string;
}> {
  const { type, data } = event;
  const session = data.object;

  // Extract order ID from session reference
  const orderId = session.reference;
  if (!orderId) {
    console.warn(`No order reference found in session ${session.id}`);
    return { success: false, message: "No order reference" };
  }

  switch (type) {
    case "checkout.session.completed":
      return await handlePaymentSuccess(orderId, session.id);

    case "checkout.session.expired":
    case "checkout.session.cancelled":
      return await handlePaymentFailure(orderId, session.id, type);

    default:
      console.warn(`Unhandled webhook event type: ${type}`);
      return { success: false, message: `Unhandled event type: ${type}` };
  }
}

/**
 * Handle successful payment completion
 */
async function handlePaymentSuccess(orderId: string, sessionId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Check if order exists and is in PENDING status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      console.error(`Order ${orderId} not found for webhook`);
      return { success: false, message: "Order not found" };
    }

    if (order.status !== "PENDING") {
      console.log(`Order ${orderId} already processed (status: ${order.status})`);
      return { success: true, message: "Order already processed" };
    }

    // Update order status and reference in transaction
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          monimeReference: sessionId,
        },
      });

      // Clean up carts
      if (order.userId) {
        // User cart
        await tx.cart.deleteMany({
          where: { userId: order.userId },
        });
      }
      // Guest cart cleanup will be handled by background job
    });

    // Confirm stock reservations (convert to actual stock decrement)
    const reservationConfirmed = await confirmReservation(orderId);
    if (!reservationConfirmed) {
      console.error(`Failed to confirm stock reservation for order ${orderId} via webhook`);
      // Order is already marked as PAID, so this requires manual intervention
      // In production, this should trigger an alert
    }

    console.log(`Successfully processed payment for order ${orderId} via webhook`);
    return { success: true, message: "Payment processed successfully" };

  } catch (error) {
    console.error(`Failed to process payment success for order ${orderId}:`, error);
    return { success: false, message: "Payment processing failed" };
  }
}

/**
 * Handle payment failure or cancellation
 */
async function handlePaymentFailure(
  orderId: string,
  sessionId: string,
  eventType: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error(`Order ${orderId} not found for webhook failure`);
      return { success: false, message: "Order not found" };
    }

    if (order.status !== "PENDING") {
      console.log(`Order ${orderId} already processed (status: ${order.status})`);
      return { success: true, message: "Order already processed" };
    }

    // Release stock reservations
    const reservationReleased = await releaseReservation(orderId);
    if (reservationReleased) {
      console.log(`Released stock reservations for ${eventType} order ${orderId}`);
    }

    // Update order status to CANCELLED
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        monimeReference: sessionId,
      },
    });

    console.log(`Order ${orderId} marked as CANCELLED due to ${eventType}`);
    return { success: true, message: `Order cancelled due to ${eventType}` };

  } catch (error) {
    console.error(`Failed to handle payment failure for order ${orderId}:`, error);
    return { success: false, message: "Failure handling failed" };
  }
}

/**
 * Verify webhook signature from Monime
 * Implementation depends on Monime's signature scheme
 */
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  // In test/development mode, skip signature verification
  const isTestMode = process.env.MONIME_API_KEY?.includes("test") ||
                     process.env.NODE_ENV === "development";

  if (isTestMode) {
    console.log("🧪 WEBHOOK TEST MODE: Skipping signature verification");
    return true;
  }

  // TODO: Implement actual signature verification when Monime provides the method
  // This would typically involve:
  // 1. Get webhook signing secret from environment
  // 2. Create HMAC hash of payload using secret
  // 3. Compare with provided signature

  if (!signature) {
    console.warn("No webhook signature provided");
    return false;
  }

  // Placeholder implementation
  console.warn("Webhook signature verification not implemented for production");
  return true; // Temporarily allow for testing
}

/**
 * GET method for webhook endpoint verification (if needed by Monime)
 */
export async function GET() {
  return NextResponse.json({
    message: "Monime webhook endpoint active",
    timestamp: new Date().toISOString(),
  });
}