import { NextResponse } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { couponCreateSchema } from "@/lib/validators/coupon";

export async function GET() {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const coupons = await prisma.coupon.findMany({
    orderBy: [{ isActive: "desc" }, { code: "asc" }],
  });

  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = couponCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const existing = await prisma.coupon.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Coupon code already exists" },
      { status: 409 },
    );
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      minOrder: parsed.data.minOrder ?? null,
      maxUses: parsed.data.maxUses ?? null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json({ coupon }, { status: 201 });
}
