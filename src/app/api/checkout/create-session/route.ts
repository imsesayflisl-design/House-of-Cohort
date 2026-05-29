import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, convertToMonimeLineItems, type CreateCheckoutSessionParams } from "@/lib/monime";
import { z } from "zod";

// Request body schema
const createSessionSchema = z.object({
  orderId: z.string(),
  metadata: z.record(z.string()).optional(),
  callbackState: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const result = createSessionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.errors },
        { status: 400 }
      );
    }

    const { orderId, metadata, callbackState } = result.data;

    // Get current session for authorization (optional for guest checkout)
    const session = await auth();

    // Fetch order with all necessary details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
              },
            },
            variant: {
              select: {
                size: true,
              },
            },
          },
        },
        address: {
          include: {
            deliveryZone: {
              select: {
                name: true,
              },
            },
          },
        },
        coupon: {
          select: {
            code: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Authorization check
    const isOwner = session?.user?.id === order.userId;
    const isGuest = !order.userId && !session; // Guest order
    const isAdmin = session?.user?.role === "ADMIN";
    const isStaff = session?.user?.role === "STAFF";

    if (!isOwner && !isGuest && !isAdmin && !isStaff) {
      return NextResponse.json(
        { error: "Unauthorized to create checkout session for this order" },
        { status: 403 }
      );
    }

    // Verify order is in correct status
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: `Order is already ${order.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Convert order items to Monime line items format
    const lineItems = convertToMonimeLineItems(order.items.map(item => ({
      product: { name: item.product.name },
      variant: { size: item.variant.size },
      quantity: item.quantity,
      price: item.price, // Already in minor units
    })));

    // Add delivery fee as a separate line item if applicable
    if (order.deliveryFee > 0) {
      lineItems.push({
        type: 'custom',
        name: `Delivery (${order.address?.deliveryZone?.name || 'Standard'})`,
        price: {
          currency: 'SLE',
          value: order.deliveryFee
        },
        quantity: 1,
        description: 'Delivery service',
        reference: 'delivery'
      });
    }

    // Apply discount as a negative line item if applicable
    if (order.discount > 0 && order.coupon) {
      lineItems.push({
        type: 'custom',
        name: `Discount (${order.coupon.code})`,
        price: {
          currency: 'SLE',
          value: -order.discount // Negative value for discount
        },
        quantity: 1,
        description: 'Coupon discount',
        reference: 'discount'
      });
    }

    // Create checkout session parameters
    const checkoutParams: CreateCheckoutSessionParams = {
      name: `House of Cohort Order #${order.id.slice(-8).toUpperCase()}`,
      orderId: order.id,
      lineItems,
      metadata: {
        orderId: order.id,
        customerEmail: order.user?.email || order.guestEmail || '',
        orderTotal: order.total.toString(),
        ...metadata
      },
      callbackState: callbackState || `order_${order.id}`
    };

    // Create the checkout session with Monime
    const checkoutSession = await createCheckoutSession(checkoutParams);

    // Store the session ID in the order for later verification
    await prisma.order.update({
      where: { id: orderId },
      data: {
        monimeSessionId: checkoutSession.sessionId,
      },
    });

    return NextResponse.json({
      success: true,
      redirectUrl: checkoutSession.redirectUrl,
      sessionId: checkoutSession.sessionId,
      orderId: order.id,
    });

  } catch (error) {
    console.error("Checkout session creation error:", error);

    // Handle specific Monime errors
    if (error instanceof Error) {
      if (error.message.includes("Invalid space")) {
        return NextResponse.json(
          { error: "Payment service configuration error" },
          { status: 500 }
        );
      }

      if (error.message.includes("line items")) {
        return NextResponse.json(
          { error: "Invalid order items" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}