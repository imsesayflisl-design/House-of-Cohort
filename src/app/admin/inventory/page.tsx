import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { InventoryTable } from "@/components/admin/InventoryTable";

type SearchParams = Promise<{ filter?: string }>;

const FILTERS = [
  { label: "All", value: undefined as string | undefined },
  { label: "Low stock", value: "low" },
  { label: "Out of stock", value: "out" },
] as const;

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { filter } = await searchParams;
  const where =
    filter === "low"
      ? { stock: { lt: 5, gt: 0 } }
      : filter === "out"
        ? { stock: 0 }
        : undefined;

  const variants = await prisma.productVariant.findMany({
    where,
    include: {
      product: { include: { category: true } },
    },
    orderBy: [{ product: { name: "asc" } }, { price: "asc" }],
  });

  const rows = variants.map((v) => ({
    variantId: v.id,
    size: v.size,
    sku: v.sku,
    stock: v.stock,
    productId: v.productId,
    productName: v.product.name,
    categoryName: v.product.category.name,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-brand-black">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? "variant" : "variants"}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = (f.value ?? "") === (filter ?? "");
          const href = f.value
            ? `/admin/inventory?filter=${f.value}`
            : "/admin/inventory";
          return (
            <Link
              key={f.label}
              href={href}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider ${
                active
                  ? "border-brand-gold bg-brand-gold/15 text-brand-gold"
                  : "border-border text-muted-foreground hover:border-brand-gold/40 hover:text-brand-black"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <InventoryTable rows={rows} />
    </div>
  );
}
