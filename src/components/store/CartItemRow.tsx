"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { formatSLE } from "@/lib/utils";

export type CartItemViewData = {
  variantId: string;
  productName: string;
  productSlug: string;
  size: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl: string | null;
};

export function CartItemRow({ item }: { item: CartItemViewData }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isPending, startTransition] = useTransition();

  function updateQuantity(next: number) {
    if (next < 1) return;
    if (next > item.stock) {
      toast.error(`Only ${item.stock} in the archive`);
      return;
    }
    setQuantity(next);
    startTransition(async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId: item.variantId, quantity: next }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Could not update bag");
        }
        router.refresh();
      } catch (err) {
        setQuantity(item.quantity);
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId: item.variantId }),
        });
        if (!res.ok) throw new Error("Could not remove item");
        toast("Item removed");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <li className="grid grid-cols-[120px_1fr] gap-6 border-b border-ink/10 py-8 last:border-b-0 sm:grid-cols-[140px_1fr]">
      <Link
        href={`/products/${item.productSlug}`}
        className="group relative aspect-[4/5] overflow-hidden bg-parchment-deep"
      >
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-5xl italic text-ink/20">
            {item.productName.charAt(0)}
          </div>
        )}
      </Link>

      <div className="flex flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/products/${item.productSlug}`}
              className="font-display text-2xl font-light text-ink transition-colors hover:text-brand-gold sm:text-3xl"
            >
              {item.productName}
            </Link>
            <p className="mt-1 text-[10px] uppercase tracking-[0.32em] text-ink/55">
              {item.size} · {formatSLE(item.price)}
            </p>
          </div>
          <p className="font-display text-xl tabular-nums text-ink sm:text-2xl">
            {formatSLE(item.price * quantity)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="inline-flex items-center gap-4 border border-ink/15 px-4 py-2">
            <button
              type="button"
              onClick={() => updateQuantity(quantity - 1)}
              disabled={isPending || quantity <= 1}
              aria-label="Decrease quantity"
              className="font-display text-lg leading-none text-ink/70 transition-colors hover:text-ink disabled:opacity-30"
            >
              −
            </button>
            <span className="min-w-[1ch] text-center font-display text-base tabular-nums text-ink">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={isPending || quantity >= item.stock}
              aria-label="Increase quantity"
              className="font-display text-lg leading-none text-ink/70 transition-colors hover:text-ink disabled:opacity-30"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="font-display text-base italic text-ink/55 underline-offset-4 transition-colors hover:text-brand-rose hover:underline"
          >
            remove
          </button>
        </div>
      </div>
    </li>
  );
}
