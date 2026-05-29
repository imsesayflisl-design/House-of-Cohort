import { NextResponse } from "next/server";
import { auth, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/enums";

const STATUSES = Object.values(OrderStatus);

export async function GET(req: Request) {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const q = searchParams.get("q")?.trim() ?? "";

  const status = statusParam && STATUSES.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { id: { contains: q, mode: "insensitive" } },
              { guestEmail: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
