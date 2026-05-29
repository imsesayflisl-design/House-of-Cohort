"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from "@/generated/prisma/enums";

const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export function OrderStatusControl({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(current);
  const [saving, setSaving] = useState(false);

  const dirty = status !== current;

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Failed to update status");
      return;
    }
    toast.success("Order status updated");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        onValueChange={(v) => setStatus(v as OrderStatus)}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_ORDER.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        disabled={!dirty || saving}
        onClick={save}
        className="bg-brand-gold text-brand-black hover:bg-brand-gold-light"
      >
        {saving ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
