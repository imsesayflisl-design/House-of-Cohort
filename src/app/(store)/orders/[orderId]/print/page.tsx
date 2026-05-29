import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReceiptPrint } from "@/components/receipt/ReceiptPrint";
import "@/styles/print.css";

interface PrintReceiptPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function PrintReceiptPage({ params }: PrintReceiptPageProps) {
  const { orderId } = await params;

  if (!orderId) {
    notFound();
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
    notFound();
  }

  // Authorization check
  const isOwner = session?.user?.id === order.userId;
  const isGuest = !order.userId && !session; // Guest order
  const isAdmin = session?.user?.role === "ADMIN";
  const isStaff = session?.user?.role === "STAFF";

  if (!isOwner && !isGuest && !isAdmin && !isStaff) {
    notFound();
  }

  // For guest orders, verify email match if session exists
  if (!order.userId && session?.user?.email) {
    const guestEmailMatch = order.guestEmail === session.user.email;
    if (!guestEmailMatch && !isAdmin && !isStaff) {
      notFound();
    }
  }

  return (
    <div className="min-h-screen bg-parchment">
      <div className="container mx-auto py-8 px-4 sm:px-8">
        <ReceiptPrint order={order} />
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: PrintReceiptPageProps) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      createdAt: true,
    },
  });

  if (!order) {
    return {
      title: "Receipt Not Found",
    };
  }

  const orderReference = order.id.slice(0, 8).toUpperCase();

  return {
    title: `Receipt ${orderReference} - House of Cohort`,
    description: `Printable receipt for order ${orderReference}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}