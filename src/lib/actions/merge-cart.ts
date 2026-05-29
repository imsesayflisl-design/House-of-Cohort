"use server";

import { cookies } from "next/headers";

import { auth } from "@/lib/auth";
import { CART_SESSION_COOKIE } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

/**
 * Idempotent. If the caller is signed in AND a `cart-session` cookie exists,
 * fold the guest cart's items into the user's cart and clear the cookie.
 * Safe to call on every authenticated page load — short-circuits when there
 * is nothing to merge.
 */
export async function mergeGuestCart(): Promise<{ merged: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { merged: false };

  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (!guestSessionId) return { merged: false };

  const guestCart = await prisma.cart.findUnique({
    where: { sessionId: guestSessionId },
    include: { items: true },
  });

  if (!guestCart) {
    safeClearCookie(cookieStore);
    return { merged: false };
  }

  await prisma.$transaction(async (tx) => {
    const userCart =
      (await tx.cart.findUnique({ where: { userId: session.user.id } })) ??
      (await tx.cart.create({ data: { userId: session.user.id } }));

    for (const item of guestCart.items) {
      await tx.cartItem.upsert({
        where: {
          cartId_variantId: {
            cartId: userCart.id,
            variantId: item.variantId,
          },
        },
        update: { quantity: { increment: item.quantity } },
        create: {
          cartId: userCart.id,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      });
    }

    await tx.cart.delete({ where: { id: guestCart.id } });
  });

  safeClearCookie(cookieStore);
  return { merged: true };
}

// Next.js 16 only allows cookie writes from Server Actions and Route Handlers.
// When this function is invoked from a Server Component (e.g. the (store)
// layout), the delete throws. The cookie is harmless after the DB-level merge
// (the cart API uses session.user.id while authenticated), so we swallow the
// error and let the next Action/Route-Handler invocation clear it.
function safeClearCookie(store: Awaited<ReturnType<typeof cookies>>) {
  try {
    store.delete(CART_SESSION_COOKIE);
  } catch {
    // Server Component context — cookie clear deferred.
  }
}
