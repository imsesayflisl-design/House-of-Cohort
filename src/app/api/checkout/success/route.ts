import { NextRequest, NextResponse } from "next/server";
import { getCheckoutSession } from "@/lib/monime";
import { prisma } from "@/lib/prisma";
import { confirmReservation } from "@/lib/stock-reservation";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const sessionId = searchParams.get('sessionId');

    if (!orderId) {
      return new Response('Missing orderId', { status: 400 });
    }

    // Load order and get stored checkout session ID
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        monimeSessionId: true,
        userId: true,
        guestEmail: true,
      }
    });

    if (!order) {
      return new Response('Order not found', { status: 404 });
    }

    // Use session ID from query params or from stored order
    const checkoutSessionId = sessionId || order.monimeSessionId;

    if (!checkoutSessionId) {
      return new Response('No checkout session found', { status: 400 });
    }

    // Verify payment status with Monime (unless already processed)
    if (order.status === 'PENDING') {
      try {
        const sessionData = await getCheckoutSession(checkoutSessionId);

        if (sessionData.status !== 'completed') {
          // Payment not completed - redirect to failure page
          const failUrl = new URL(`/checkout/failed?orderId=${encodeURIComponent(orderId)}`,
                                   process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
          return NextResponse.redirect(failUrl);
        }

        // Payment verified - update order status
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: orderId },
            data: {
              status: "PAID",
              monimeReference: checkoutSessionId,
            },
          });

          // Clean up carts
          if (order.userId) {
            // User cart
            await tx.cart.deleteMany({
              where: { userId: order.userId },
            });
          } else {
            // Guest cart - cleanup will be handled by background job
            // since we don't have session ID here
          }
        });

        // Confirm stock reservations
        const reservationConfirmed = await confirmReservation(orderId);
        if (!reservationConfirmed) {
          console.error(`Failed to confirm stock reservation for order ${orderId}`);
        }

        // Send receipt email automatically
        try {
          const orderWithDetails = await prisma.order.findUnique({
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

          if (orderWithDetails) {
            const emailResult = await sendOrderConfirmationEmail(orderWithDetails);
            if (emailResult.success) {
              console.log(`Receipt email sent successfully for order ${orderId}`);
            } else {
              console.error(`Failed to send receipt email for order ${orderId}:`, emailResult.error);
            }
          }
        } catch (emailError) {
          console.error(`Error sending receipt email for order ${orderId}:`, emailError);
        }

      } catch (verificationError) {
        console.error('Payment verification failed:', verificationError);
        // Redirect to failure page
        const failUrl = new URL(`/checkout/failed?orderId=${encodeURIComponent(orderId)}`,
                                 process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
        return NextResponse.redirect(failUrl);
      }
    }

    // Redirect to success UI
    const successUrl = new URL(`/checkout/success?orderId=${encodeURIComponent(orderId)}`,
                               process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Checkout success handler error:', error);

    // Redirect to a generic failure page
    const failUrl = new URL('/checkout/failed',
                            process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    return NextResponse.redirect(failUrl);
  }
}

// Also handle POST requests from Monime callbacks
export async function POST(req: NextRequest) {
  // For webhook-style callbacks, parse the body
  try {
    const body = await req.json();
    const orderId = body.orderId || body.metadata?.orderId;
    const sessionId = body.sessionId;

    if (!orderId) {
      return new Response('Missing orderId', { status: 400 });
    }

    // Redirect to the GET handler with the same parameters
    const redirectUrl = new URL(req.url);
    redirectUrl.searchParams.set('orderId', orderId);
    if (sessionId) {
      redirectUrl.searchParams.set('sessionId', sessionId);
    }

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('POST callback error:', error);
    return new Response('Invalid callback data', { status: 400 });
  }
}