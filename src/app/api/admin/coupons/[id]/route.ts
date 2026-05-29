import { NextResponse } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { couponUpdateSchema } from "@/lib/validators/coupon";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = couponUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  const next = {
    type: parsed.data.type ?? existing.type,
    value: parsed.data.value ?? existing.value,
  };
  if (
    next.type === "PERCENTAGE" &&
    (next.value < 1 || next.value > 100)
  ) {
    return NextResponse.json(
      { error: "Percentage must be between 1 and 100" },
      { status: 400 },
    );
  }

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(parsed.data.type !== undefined && { type: parsed.data.type }),
      ...(parsed.data.value !== undefined && { value: parsed.data.value }),
      ...(parsed.data.minOrder !== undefined && {
        minOrder: parsed.data.minOrder,
      }),
      ...(parsed.data.maxUses !== undefined && {
        maxUses: parsed.data.maxUses,
      }),
      ...(parsed.data.expiresAt !== undefined && {
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      }),
      ...(parsed.data.isActive !== undefined && {
        isActive: parsed.data.isActive,
      }),
    },
  });

  return NextResponse.json({ coupon });
}
