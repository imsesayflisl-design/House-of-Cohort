"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StockEditor({
  variantId,
  initialStock,
}: {
  variantId: string;
  initialStock: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState<string>(String(initialStock));
  const [saving, setSaving] = useState(false);

  const numeric = Number(value);
  const dirty = !Number.isNaN(numeric) && numeric !== initialStock;

  async function save() {
    if (!dirty || Number.isNaN(numeric) || numeric < 0) return;
    setSaving(true);
    const res = await fetch(`/api/admin/inventory/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: numeric }),
    });
    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Failed to update stock");
      return;
    }
    toast.success("Stock updated");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24"
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!dirty || saving}
        onClick={save}
      >
        {saving ? "…" : "Save"}
      </Button>
    </div>
  );
}
