"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";

export function CouponActiveToggle({
  couponId,
  isActive,
}: {
  couponId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(isActive);
  const [pending, setPending] = useState(false);

  async function onChange(next: boolean) {
    setOptimistic(next);
    setPending(true);
    const res = await fetch(`/api/admin/coupons/${couponId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    });
    setPending(false);

    if (!res.ok) {
      setOptimistic(!next);
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Failed to update coupon");
      return;
    }
    toast.success(next ? "Coupon activated" : "Coupon deactivated");
    router.refresh();
  }

  return (
    <Switch
      checked={optimistic}
      disabled={pending}
      onCheckedChange={onChange}
      aria-label="Toggle coupon active state"
    />
  );
}
