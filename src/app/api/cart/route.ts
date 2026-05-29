import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  CART_COOKIE_MAX_AGE,
  CART_SESSION_COOKIE,
  getCartWithItems,
  getOrCreateCart,
} from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import {
  cartAddSchema,
  cartRemoveSchema,
  cartUpdateSchema,
} from "@/lib/validators/cart";

type Identity = { userId: string | null; sessionId: string | null };

async function resolveIdentity({
  createGuestSession = false,
}: { createGuestSession?: boolean } = {}): Promise<{
  identity: Identity;
  setCookie: string | null;
}> {
  const session = await auth();
  if (session?.user?.id) {
    return {
      identity: { userId: session.user.id, sessionId: null },
      setCookie: null,
    };
  }
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (existing) {
    return { identity: { userId: null, sessionId: existing }, setCookie: null };
  }
  if (!createGuestSession) {
    return { identity: { userId: null, sessionId: null }, setCookie: null };
  }
  const fresh = randomUUID();
  return { identity: { userId: null, sessionId: fresh }, setCookie: fresh };
}

function withCartCookie<T>(response: NextResponse<T>, cookieValue: string | null) {
  if (cookieValue) {
    response.cookies.set({
      name: CART_SESSION_COOKIE,
      value: cookieValue,
      maxAge: CART_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }
  return response;
}

export async function GET() {
  const { identity } = await resolveIdentity();
  if (!identity.userId && !identity.sessionId) {
    return NextResponse.json({ cart: null });
  }
  const cart = await getCartWithItems(identity);
  return NextResponse.json({ cart });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = cartAddSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { variantId } = parsed.data;
  const quantity = parsed.data.quantity ?? 1;

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, stock: true, product: { select: { isActive: true } } },
  });
  if (!variant || !variant.product.isActive) {
    return NextResponse.json({ error: "Product not available" }, { status: 404 });
  }
  if (variant.stock < quantity) {
    return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
  }

  const { identity, setCookie } = await resolveIdentity({ createGuestSession: true });
  const cart = await getOrCreateCart(identity);

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, variantId, quantity },
  });

  const refreshed = await getCartWithItems(identity);
  return withCartCookie(NextResponse.json({ cart: refreshed }), setCookie);
}

export async function PATCH(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = cartUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { variantId, quantity } = parsed.data;

  const { identity } = await resolveIdentity();
  if (!identity.userId && !identity.sessionId) {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }
  const cart = await getOrCreateCart(identity);

  if (quantity === 0) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, variantId } });
  } else {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stock: true },
    });
    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }
    if (variant.stock < quantity) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
    }
    await prisma.cartItem.update({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      data: { quantity },
    });
  }

  const refreshed = await getCartWithItems(identity);
  return NextResponse.json({ cart: refreshed });
}

export async function DELETE(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = cartRemoveSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { variantId } = parsed.data;

  const { identity } = await resolveIdentity();
  if (!identity.userId && !identity.sessionId) {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }
  const cart = await getOrCreateCart(identity);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, variantId } });

  const refreshed = await getCartWithItems(identity);
  return NextResponse.json({ cart: refreshed });
}
