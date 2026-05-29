"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductFormValues } from "./ProductForm";

export function VariantManager({
  control,
}: {
  control: Control<ProductFormValues>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {fields.map((field, index) => (
          <VariantRow
            key={field.id}
            index={index}
            control={control}
            canDelete={fields.length > 1}
            onDelete={() => remove(index)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ size: "", priceSLE: "" as unknown as number, stock: 0, sku: "" })
        }
      >
        <Plus className="size-4" /> Add variant
      </Button>
    </div>
  );
}

function VariantRow({
  index,
  control,
  canDelete,
  onDelete,
}: {
  index: number;
  control: Control<ProductFormValues>;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const errors = control._formState?.errors?.variants?.[index];

  return (
    <div className="grid grid-cols-12 gap-3 rounded-md border border-border bg-white p-3 items-start">
      <Field label="Size" className="col-span-3" error={errors?.size?.message}>
        <Input
          {...control.register(`variants.${index}.size` as const)}
          placeholder="50ml"
        />
      </Field>
      <Field
        label="Price (SLE)"
        className="col-span-3"
        error={errors?.priceSLE?.message as string | undefined}
      >
        <Input
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="250.00"
          {...control.register(`variants.${index}.priceSLE` as const)}
        />
      </Field>
      <Field
        label="Stock"
        className="col-span-2"
        error={errors?.stock?.message}
      >
        <Input
          type="number"
          min={0}
          step={1}
          {...control.register(`variants.${index}.stock` as const, {
            valueAsNumber: true,
          })}
        />
      </Field>
      <Field label="SKU" className="col-span-3" error={errors?.sku?.message}>
        <Input
          {...control.register(`variants.${index}.sku` as const)}
          placeholder="optional"
        />
      </Field>
      <div className="col-span-1 flex justify-end pt-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canDelete}
          onClick={onDelete}
          aria-label="Remove variant"
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  error,
  children,
}: {
  label: string;
  className?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
