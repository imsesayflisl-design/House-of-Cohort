import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCheckoutSession } from "@/lib/monime";
import { CART_SESSION_COOKIE } from "@/lib/cart";
import { confirmReservation, releaseReservation } from "@/lib/stock-reservation";
import { queueOrderConfirmationEmail } from "@/lib/jobs/email-queue";

export async function GET(req: NextRequest) {
  let orderId: string | null = null;
  try {
    const { searchParams } = new URL(req.url);
    orderId = searchParams.get("orderId");
    const sessionId = searchParams.get("sid");

    if (!orderId || !sessionId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: { select: { id: true, stock: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Check if already verified (idempotency)
    if (order.status !== "PENDING") {
      return NextResponse.json({
        verified: true,
        orderId,
        message: "Order already processed"
      });
    }

    // 3. Verify payment with Monime
    const monimeSession = await getCheckoutSession(sessionId);

    if (monimeSession.status !== "completed") {
      return NextResponse.json({
        verified: false,
        orderId,
        message: "Payment not completed"
      });
    }

    // 4. Verify the session belongs to this order (skip in test mode)
    const isTestMode = process.env.MONIME_API_KEY?.includes("test") ||
                       process.env.NODE_ENV === "development";

    if (!isTestMode && monimeSession.reference !== orderId) {
      return NextResponse.json({
        verified: false,
        orderId,
        message: "Payment session mismatch"
      });
    }

    // In test mode, we trust that the session is valid since we generated it
    if (isTestMode) {
      console.log("🧪 MONIME TEST MODE: Skipping reference verification");
    }

    // 5. Process successful payment in transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId! },
        data: {
          status: "PAID",
          monimeReference: sessionId,
        },
      });

      // Note: Stock reservation will be confirmed outside transaction

      // Delete the cart (guest or user)
      if (order.userId) {
        // User cart
        await tx.cart.deleteMany({
          where: { userId: order.userId },
        });
      } else {
        // Guest cart - clean up using the session ID from the request
        // Extract session ID from the request headers if available
        const guestSessionId = req.headers.get('x-cart-session-id');
        if (guestSessionId) {
          await tx.cart.deleteMany({
            where: { sessionId: guestSessionId },
          });
        }
        // Note: If no session ID available, guest cart cleanup will be handled
        // by background job for carts older than 30 days
      }
    });

    // 6. Confirm stock reservations (convert to actual stock decrement)
    const reservationConfirmed = await confirmReservation(orderId);
    if (!reservationConfirmed) {
      console.error(`Failed to confirm stock reservation for order ${orderId}`);
      // Note: Order is already marked as PAID, so this is logged as warning
      // In production, this should trigger an alert for manual intervention
    }

    // 7. Queue receipt email for background processing
    try {
      await queueOrderConfirmationEmail(
        orderId,
        "Thank you for your order! Your receipt is attached below."
      );
      console.log(`Receipt email queued for background processing: order ${orderId}`);
    } catch (emailError) {
      // Log error but don't fail the verification
      console.error(`Error queueing receipt email for order ${orderId}:`, emailError);
    }

    return NextResponse.json({
      verified: true,
      orderId,
      message: "Payment verified and order processed"
    });

  } catch (error) {
    console.error("Payment verification error:", error);

    // Release stock reservations on verification failure
    if (orderId) {
      const released = await releaseReservation(orderId);
      if (released) {
        console.log(`Released stock reservations for failed order ${orderId}`);
      }
    }

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}