import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CART_SESSION_COOKIE, getCartWithItems } from "@/lib/cart";
import { validateCoupon, calculateCouponDiscount } from "@/lib/coupon";
import { checkoutSchema } from "@/lib/validators/checkout";
import { reserveStock, getAvailableStock } from "@/lib/stock-reservation";

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const json = await req.json().catch(() => null);
    const parsed = checkoutSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const {
      guestEmail,
      recipientName,
      phone,
      streetAddress,
      city,
      deliveryZoneId,
      couponCode,
    } = parsed.data;

    // 1. Get session (may be null for guests)
    const session = await auth();

    // 2. Get cart
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
    const identity = session?.user?.id
      ? { userId: session.user.id, sessionId: null }
      : { userId: null, sessionId };

    const cartWithItems = await getCartWithItems(identity);
    if (!cartWithItems || cartWithItems.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 3. Check stock availability for all items (including reservations)
    for (const item of cartWithItems.items) {
      const availability = await getAvailableStock(item.variantId);
      if (availability.availableStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.variant.product.name} (${item.variant.size}). Available: ${availability.availableStock}, Requested: ${item.quantity}` },
          { status: 400 }
        );
      }
    }

    // 4. Validate delivery zone
    const deliveryZone = await prisma.deliveryZone.findUnique({
      where: { id: deliveryZoneId, isActive: true },
    });
    if (!deliveryZone) {
      return NextResponse.json({ error: "Invalid delivery zone" }, { status: 400 });
    }

    // 5. Calculate totals
    const subtotal = cartWithItems.items.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    );

    let discount = 0;
    let coupon = null;

    // 6. Validate and apply coupon if provided
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      const couponError = validateCoupon(coupon, subtotal);
      if (couponError || !coupon) {
        return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 400 });
      }

      discount = calculateCouponDiscount(coupon, subtotal);
    }

    const deliveryFee = deliveryZone.fee;
    const total = subtotal + deliveryFee - discount;

    // 7. Create database records in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create address
      const address = await tx.address.create({
        data: {
          userId: session?.user?.id || null,
          recipientName,
          phone,
          streetAddress,
          city,
          deliveryZoneId,
        },
      });

      // Create order
      const order = await tx.order.create({
        data: {
          userId: session?.user?.id || null,
          guestEmail: session?.user?.id ? null : guestEmail,
          status: "PENDING",
          subtotal,
          deliveryFee,
          discount,
          total,
          deliveryZoneId,
          addressId: address.id,
          couponId: coupon?.id || null,
          items: {
            create: cartWithItems.items.map((item) => ({
              variantId: item.variantId,
              productId: item.variant.productId,
              quantity: item.quantity,
              price: item.variant.price, // Price snapshot at time of purchase
            })),
          },
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: { select: { name: true, images: true } },
                },
              },
            },
          },
        },
      });

      // Increment coupon usage if coupon was applied
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      return order;
    });

    // 7.5. Reserve stock for the order
    const reservationItems = cartWithItems.items.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const reservationResult = await reserveStock(result.id, reservationItems);
    if (!reservationResult.success) {
      // If stock reservation fails, we should clean up the order
      await prisma.order.delete({ where: { id: result.id } });
      return NextResponse.json(
        { error: `Stock reservation failed: ${reservationResult.message}` },
        { status: 400 }
      );
    }

    // 8. Return order ID for payment form instead of creating Monime checkout session
    return NextResponse.json({
      orderId: result.id,
      success: true,
      message: "Order created successfully. Please complete payment."
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
