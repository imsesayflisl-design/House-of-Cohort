import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const address = await prisma.address.findUnique({
    where: { id },
    select: { userId: true, orders: { select: { id: true }, take: 1 } },
  });
  if (!address || address.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (address.orders.length > 0) {
    return NextResponse.json(
      { error: "This address is used by past orders and cannot be deleted." },
      { status: 400 },
    );
  }
  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
