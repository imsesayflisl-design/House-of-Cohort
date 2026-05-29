import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  calculateCouponDiscount,
  couponErrorMessage,
  validateCoupon,
} from "@/lib/coupon";
import { applyCouponSchema } from "@/lib/validators/checkout";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = applyCouponSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { code, subtotal } = parsed.data;

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  const error = validateCoupon(coupon, subtotal);
  if (error || !coupon) {
    return NextResponse.json(
      { error: couponErrorMessage(error ?? "not_found") },
      { status: 400 },
    );
  }

  const discount = calculateCouponDiscount(coupon, subtotal);
  return NextResponse.json({
    discount,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
  });
}
