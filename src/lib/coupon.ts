import type { CouponModel as Coupon } from "@/generated/prisma/models";

export type CouponValidationError =
  | "not_found"
  | "inactive"
  | "expired"
  | "max_uses_reached"
  | "min_order_not_met";

export function validateCoupon(
  coupon:
    | Pick<Coupon, "isActive" | "expiresAt" | "maxUses" | "usedCount" | "minOrder">
    | null,
  subtotal: number,
): CouponValidationError | null {
  if (!coupon) return "not_found";
  if (!coupon.isActive) return "inactive";
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return "expired";
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return "max_uses_reached";
  }
  if (coupon.minOrder !== null && subtotal < coupon.minOrder) {
    return "min_order_not_met";
  }
  return null;
}

export function calculateCouponDiscount(
  coupon: Pick<Coupon, "type" | "value">,
  subtotal: number,
): number {
  const raw =
    coupon.type === "PERCENTAGE"
      ? Math.floor((subtotal * coupon.value) / 100)
      : coupon.value;
  return Math.max(0, Math.min(raw, subtotal));
}

export function couponErrorMessage(err: CouponValidationError): string {
  switch (err) {
    case "not_found":
      return "Coupon code not found";
    case "inactive":
      return "This coupon is no longer active";
    case "expired":
      return "This coupon has expired";
    case "max_uses_reached":
      return "This coupon has reached its maximum uses";
    case "min_order_not_met":
      return "Your order doesn't meet the minimum spend for this coupon";
  }
}
