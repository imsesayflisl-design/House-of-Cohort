"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  feeSLE: z.coerce.number().min(0, "Fee cannot be negative"),
  isActive: z.boolean(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export type DeliveryZoneInitial = {
  id: string;
  name: string;
  fee: number;
  isActive: boolean;
};

export function DeliveryZoneDialog({
  zone,
  trigger,
}: {
  zone?: DeliveryZoneInitial;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const editing = Boolean(zone);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: zone?.name ?? "",
      feeSLE: zone ? zone.fee / 100 : 0,
      isActive: zone?.isActive ?? true,
    },
  });

  async function onSubmit(values: FormOutput) {
    setSubmitting(true);
    const payload = {
      name: values.name,
      fee: Math.round(values.feeSLE * 100),
      isActive: values.isActive,
    };

    const url = editing
      ? `/api/admin/delivery/${zone!.id}`
      : "/api/admin/delivery";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Failed to save zone");
      return;
    }

    toast.success(editing ? "Zone updated" : "Zone created");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger
          render={
            <Button className="bg-brand-gold text-brand-black hover:bg-brand-gold-light" />
          }
        >
          <Plus className="size-4" /> Add zone
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? `Edit ${zone!.name}` : "New delivery zone"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="zone-name">Name</Label>
            <Input id="zone-name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="zone-fee">Delivery fee (SLE)</Label>
            <Input
              id="zone-fee"
              type="number"
              step="0.01"
              min={0}
              {...form.register("feeSLE")}
            />
            {form.formState.errors.feeSLE && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.feeSLE.message}
              </p>
            )}
          </div>

          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <label className="flex items-center gap-3 cursor-pointer">
                <Switch checked={field.value} onCheckedChange={field.onChange} />
                <span className="text-sm">Active (available at checkout)</span>
              </label>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-brand-gold text-brand-black hover:bg-brand-gold-light"
            >
              {submitting ? "Saving…" : editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditDeliveryZoneButton({ zone }: { zone: DeliveryZoneInitial }) {
  return (
    <DeliveryZoneDialog
      zone={zone}
      trigger={
        <Button variant="ghost" size="icon" aria-label={`Edit ${zone.name}`}>
          <Pencil className="size-4" />
        </Button>
      }
    />
  );
}
