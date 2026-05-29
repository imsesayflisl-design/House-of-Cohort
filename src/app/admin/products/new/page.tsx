import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/products"
          className="text-xs uppercase tracking-widest text-muted-foreground hover:text-brand-gold"
        >
          ← Back to products
        </Link>
        <h1 className="mt-2 font-serif text-3xl text-brand-black">
          New product
        </h1>
      </header>

      {categories.length === 0 ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          You need to{" "}
          <Link href="/admin/categories" className="font-medium underline">
            create a category
          </Link>{" "}
          before adding products.
        </div>
      ) : (
        <ProductForm categories={categories} />
      )}
    </div>
  );
}
