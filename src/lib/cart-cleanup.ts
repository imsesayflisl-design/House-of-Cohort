import { cookies } from "next/headers";
import { CART_SESSION_COOKIE } from "./cart";
import { prisma } from "./prisma";

/**
 * Clear guest cart after successful payment.
 * This function can be called from the checkout success page.
 */
export async function clearGuestCart(guestSessionId?: string | null) {
  if (!guestSessionId) {
    // Try to get from cookies if not provided
    const cookieStore = await cookies();
    guestSessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
  }

  if (guestSessionId) {
    try {
      await prisma.cart.deleteMany({
        where: { sessionId: guestSessionId },
      });
    } catch (error) {
      console.warn("Failed to clear guest cart:", error);
      // Don't throw - cart cleanup is not critical for the user experience
    }
  }
}

/**
 * Clear cart cookie.
 * Call this from the checkout success page for guest orders.
 */
export async function clearCartCookie() {
  const cookieStore = await cookies();
  cookieStore.set(CART_SESSION_COOKIE, "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}