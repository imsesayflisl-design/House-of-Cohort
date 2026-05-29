"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export function DeliveryZoneActiveToggle({
  zoneId,
  isActive,
}: {
  zoneId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(isActive);
  const [pending, setPending] = useState(false);

  async function onChange(next: boolean) {
    setOptimistic(next);
    setPending(true);
    const res = await fetch(`/api/admin/delivery/${zoneId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    });
    setPending(false);

    if (!res.ok) {
      setOptimistic(!next);
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Failed to update zone");
      return;
    }
    toast.success(next ? "Zone activated" : "Zone deactivated");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={optimistic}
        disabled={pending}
        onCheckedChange={onChange}
        aria-label="Toggle delivery zone"
      />
      <Tooltip>
        <TooltipTrigger
          aria-label="Why can't I delete zones?"
          className="inline-flex items-center text-muted-foreground"
        >
          <Info className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent>
          Zones cannot be deleted because past orders reference them. Deactivate
          to hide from checkout.
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
