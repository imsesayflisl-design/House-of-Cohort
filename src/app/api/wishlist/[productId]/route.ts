import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to use the wishlist" }, { status: 401 });
  }

  const { productId } = await params;
  await prisma.wishlistItem.deleteMany({
    where: { userId: session.user.id, productId },
  });
  return NextResponse.json({ ok: true });
}
