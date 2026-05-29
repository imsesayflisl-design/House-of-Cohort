import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resendReceiptEmail } from "@/lib/email";
import { z } from "zod";

// Request body schema
const emailReceiptSchema = z.object({
  customMessage: z.string().max(500).optional(),
  includePDF: z.boolean().default(true),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const result = emailReceiptSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: result.error.errors
        },
        { status: 400 }
      );
    }

    const { customMessage, includePDF } = result.data;

    // Get current session for authorization
    const session = await auth();

    // Fetch order with all necessary relations
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
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
            type: true,
            value: true,
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

    // Check if order has an email address
    const recipientEmail = order.user?.email || order.guestEmail;
    if (!recipientEmail) {
      return NextResponse.json(
        { error: "No email address associated with this order" },
        { status: 400 }
      );
    }

    // Authorization check
    const isOwner = session?.user?.id === order.userId;
    const isGuest = !order.userId && !session; // Guest order
    const isAdmin = session?.user?.role === "ADMIN";
    const isStaff = session?.user?.role === "STAFF";

    if (!isOwner && !isGuest && !isAdmin && !isStaff) {
      return NextResponse.json(
        { error: "Unauthorized to send receipt for this order" },
        { status: 403 }
      );
    }

    // For guest orders, verify email match if session exists
    if (!order.userId && session?.user?.email) {
      const guestEmailMatch = order.guestEmail === session.user.email;
      if (!guestEmailMatch && !isAdmin && !isStaff) {
        return NextResponse.json(
          { error: "Unauthorized to send receipt for this order" },
          { status: 403 }
        );
      }
    }

    // Send the receipt email
    const emailResult = await resendReceiptEmail(order, customMessage);

    if (!emailResult.success) {
      return NextResponse.json(
        {
          error: "Failed to send receipt email",
          details: emailResult.error
        },
        { status: 500 }
      );
    }

    // Update order with email sent timestamp
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          receiptEmailSentAt: new Date(),
          receiptEmailStatus: 'sent',
        },
      });
    } catch (updateError) {
      // Log the error but don't fail the request since email was sent successfully
      console.error("Failed to update order email status:", updateError);
    }

    return NextResponse.json({
      success: true,
      message: "Receipt email sent successfully",
      emailId: emailResult.id,
      sentTo: recipientEmail,
      includedPDF: includePDF,
    });

  } catch (error) {
    console.error("Email receipt API error:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      if (error.message.includes("Invalid email")) {
        return NextResponse.json(
          { error: "Invalid email address" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get email status for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get current session for authorization
    const session = await auth();

    // Fetch order email status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        guestEmail: true,
        receiptEmailSentAt: true,
        receiptEmailStatus: true,
        user: {
          select: {
            email: true,
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
    const isAdmin = session?.user?.role === "ADMIN";
    const isStaff = session?.user?.role === "STAFF";

    if (!isOwner && !isAdmin && !isStaff) {
      return NextResponse.json(
        { error: "Unauthorized to view email status for this order" },
        { status: 403 }
      );
    }

    const recipientEmail = order.user?.email || order.guestEmail;

    return NextResponse.json({
      orderId: order.id,
      hasEmail: !!recipientEmail,
      emailAddress: recipientEmail,
      lastSentAt: order.receiptEmailSentAt,
      status: order.receiptEmailStatus || 'not_sent',
      canResend: !!recipientEmail,
    });

  } catch (error) {
    console.error("Email status API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}