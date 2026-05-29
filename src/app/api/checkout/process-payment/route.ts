import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { confirmReservation } from "@/lib/stock-reservation";

// Payment processing schema
const processPaymentSchema = z.object({
  orderId: z.string(),
  paymentData: z.object({
    cardNumber: z.string(),
    expiryDate: z.string(),
    cvv: z.string(),
    cardholderName: z.string(),
    bankCode: z.string(),
    amount: z.number(),
  }),
});

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const json = await req.json().catch(() => null);
    const parsed = processPaymentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment data" }, { status: 400 });
    }

    const { orderId, paymentData } = parsed.data;

    // 1. Verify the order exists and is in PENDING status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: `Order is already ${order.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // 2. Verify the amount matches the order total
    if (paymentData.amount !== order.total) {
      return NextResponse.json(
        { error: "Payment amount does not match order total" },
        { status: 400 }
      );
    }

    // 3. Process payment with Monime
    const paymentResult = await processPaymentWithMonime(orderId, paymentData);

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || "Payment processing failed" },
        { status: 400 }
      );
    }

    // 4. Update order status and reference in transaction
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          monimeReference: paymentResult.transactionId,
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

    // 5. Confirm stock reservations (convert to actual stock decrement)
    const reservationConfirmed = await confirmReservation(orderId);
    if (!reservationConfirmed) {
      console.error(`Failed to confirm stock reservation for order ${orderId} after payment`);
      // Order is already marked as PAID, so this requires manual intervention
    }

    console.log(`Successfully processed payment for order ${orderId}`);

    return NextResponse.json({
      success: true,
      orderId,
      transactionId: paymentResult.transactionId,
      message: "Payment processed successfully",
    });

  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Process payment with Monime API
 * This function handles the actual payment processing with bank details
 */
async function processPaymentWithMonime(
  orderId: string,
  paymentData: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    bankCode: string;
    amount: number;
  }
) {
  const isTestMode = process.env.MONIME_API_KEY?.includes("test") ||
                     process.env.NODE_ENV === "development";

  if (isTestMode) {
    // Simulate payment processing for testing
    console.log("🧪 MONIME TEST MODE: Simulating payment processing");
    console.log("Order ID:", orderId);
    console.log("Amount:", paymentData.amount);
    console.log("Bank:", paymentData.bankCode);
    console.log("Card (masked):", paymentData.cardNumber.slice(-4).padStart(16, "*"));

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success (you can simulate failures for testing)
    if (paymentData.cardNumber === "1234567890123456") {
      return {
        success: false,
        error: "Test card declined - insufficient funds",
      };
    }

    return {
      success: true,
      transactionId: `test_txn_${orderId.slice(-8)}_${Date.now()}`,
    };
  }

  // Real Monime payment processing
  try {
    const response = await fetch(`${process.env.MONIME_API_URL}/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MONIME_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        currency: "SLE", // Sierra Leone Leone
        reference: orderId,
        customer: {
          name: paymentData.cardholderName,
        },
        card: {
          number: paymentData.cardNumber,
          expiry_month: paymentData.expiryDate.split("/")[0],
          expiry_year: `20${paymentData.expiryDate.split("/")[1]}`,
          cvv: paymentData.cvv,
        },
        bank_code: paymentData.bankCode,
        description: `Payment for House of Cohort order ${orderId}`,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Monime payment error:", result);
      return {
        success: false,
        error: result.message || "Payment failed",
      };
    }

    return {
      success: result.status === "success",
      transactionId: result.transaction_id,
      error: result.status !== "success" ? result.message : undefined,
    };

  } catch (error) {
    console.error("Monime API error:", error);
    return {
      success: false,
      error: "Payment service unavailable",
    };
  }
}