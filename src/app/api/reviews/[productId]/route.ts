import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}
