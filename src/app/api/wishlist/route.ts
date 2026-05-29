import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({ productId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to use the wishlist" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = inputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, isActive: true },
  });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const item = await prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: parsed.data.productId,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      productId: parsed.data.productId,
    },
  });
  return NextResponse.json({ wishlistItem: item });
}
