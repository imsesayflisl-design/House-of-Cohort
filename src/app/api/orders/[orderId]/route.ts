import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true } },
            variant: { select: { size: true } },
          },
        },
        address: {
          include: {
            deliveryZone: { select: { name: true } }
          }
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Return the order data in the format expected by the client
    return NextResponse.json({
      id: order.id,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      total: order.total,
      userId: order.userId,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: {
          name: item.product.name,
          slug: item.product.slug,
        },
        variant: {
          size: item.variant.size,
        },
      })),
      address: {
        recipientName: order.address.recipientName,
        streetAddress: order.address.streetAddress,
        city: order.address.city,
        phone: order.address.phone,
        deliveryZone: {
          name: order.address.deliveryZone.name,
        },
      },
    });

  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}