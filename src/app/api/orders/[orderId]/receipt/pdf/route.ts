import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReceiptPDF } from "@/components/receipt/ReceiptPDF";
import { withPDFTimeout, PDFTimeoutError, logPDFPerformance } from "@/lib/pdf-timeout";

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

    // Authorization check
    const isOwner = session?.user?.id === order.userId;
    const isGuest = !order.userId && !session; // Guest order
    const isAdmin = session?.user?.role === "ADMIN";
    const isStaff = session?.user?.role === "STAFF";

    if (!isOwner && !isGuest && !isAdmin && !isStaff) {
      return NextResponse.json(
        { error: "Unauthorized to access this receipt" },
        { status: 403 }
      );
    }

    // For guest orders, verify email match if session exists
    if (!order.userId && session?.user?.email) {
      const guestEmailMatch = order.guestEmail === session.user.email;
      if (!guestEmailMatch) {
        return NextResponse.json(
          { error: "Unauthorized to access this receipt" },
          { status: 403 }
        );
      }
    }

    // Generate PDF with timeout protection
    const startTime = Date.now();
    let pdfBuffer: Buffer;

    try {
      pdfBuffer = await withPDFTimeout(
        renderToBuffer(ReceiptPDF({ order })),
        60000 // 60 second timeout
      );
      logPDFPerformance(startTime, orderId, true);
    } catch (error) {
      logPDFPerformance(startTime, orderId, false);

      if (error instanceof PDFTimeoutError) {
        console.error(`PDF generation timeout for order ${orderId}:`, error.message);
        return NextResponse.json(
          { error: "PDF generation is taking too long. Please try again later or contact support." },
          { status: 504 } // Gateway Timeout
        );
      }

      // Re-throw other errors to be handled by the outer catch block
      throw error;
    }

    // Generate filename
    const orderReference = order.id.slice(0, 8).toUpperCase();
    const filename = `Receipt-${orderReference}.pdf`;

    // Return PDF with proper headers
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600", // Cache for 1 hour
        "Content-Length": pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("PDF generation error:", error);

    // Handle specific PDF generation errors
    if (error instanceof Error) {
      if (error.message.includes("renderToBuffer")) {
        return NextResponse.json(
          { error: "Failed to generate PDF. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add OPTIONS handler for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}