import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewInputSchema } from "@/lib/validators/review";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to leave a review" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = reviewInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, isActive: true },
  });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const review = await prisma.review.upsert({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: parsed.data.productId,
      },
    },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    },
    create: {
      userId: session.user.id,
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    },
  });

  return NextResponse.json({ review });
}
