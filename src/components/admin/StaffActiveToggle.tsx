"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";

export function StaffActiveToggle({
  staffId,
  isActive,
  disabled,
}: {
  staffId: string;
  isActive: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(isActive);
  const [pending, setPending] = useState(false);

  async function onChange(next: boolean) {
    setOptimistic(next);
    setPending(true);
    const res = await fetch(`/api/admin/staff/${staffId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    });
    setPending(false);

    if (!res.ok) {
      setOptimistic(!next);
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Failed to update status");
      return;
    }
    toast.success(next ? "Account activated" : "Account deactivated");
    router.refresh();
  }

  return (
    <Switch
      checked={optimistic}
      disabled={disabled || pending}
      onCheckedChange={onChange}
      aria-label="Toggle staff active state"
    />
  );
}
