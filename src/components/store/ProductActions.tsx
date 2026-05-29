"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { cn, formatSLE } from "@/lib/utils";

type Variant = {
  id: string;
  size: string;
  price: number;
  stock: number;
};

type Props = {
  productId: string;
  productName: string;
  variants: Variant[];
  isAuthenticated: boolean;
  isInWishlist: boolean;
};

function stockTone(stock: number) {
  if (stock === 0) return { label: "Sold out", color: "text-brand-rose" };
  if (stock <= 4) return { label: "Last few in the archive", color: "text-brand-rose" };
  return { label: "In the archive", color: "text-brand-moss" };
}

export function ProductActions({
  productId,
  productName,
  variants,
  isAuthenticated,
  isInWishlist,
}: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const [isAdding, startAdding] = useTransition();
  const [isToggling, startToggling] = useTransition();
  const [wishlisted, setWishlisted] = useState(isInWishlist);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const tone = stockTone(selected.stock);

  function addToCart() {
    startAdding(async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId: selected.id, quantity: 1 }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Could not add to cart");
        }
        toast.success("Added to your bag", { description: productName });
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function toggleWishlist() {
    if (!isAuthenticated) {
      router.push(`/auth/signin?callbackUrl=/products`);
      return;
    }
    startToggling(async () => {
      try {
        if (wishlisted) {
          const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Could not update wishlist");
          setWishlisted(false);
          toast("Removed from wishlist");
        } else {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
          if (!res.ok) throw new Error("Could not update wishlist");
          setWishlisted(true);
          toast.success("Added to wishlist");
        }
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-6 border-b border-ink/15 pb-5">
        <p className="font-display text-[2.6rem] font-light leading-none tabular-nums text-ink">
          {formatSLE(selected.price)}
        </p>
        <p className={cn("text-[10px] uppercase tracking-[0.32em]", tone.color)}>
          {tone.label}
        </p>
      </div>

      <div>
        <p className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-brand-gold">
          Format
          <span className="inline-block h-px flex-1 bg-ink/15" />
        </p>
        <div className="flex flex-wrap gap-3">
          {variants.map((variant) => {
            const active = variant.id === selected.id;
            const outOfStock = variant.stock === 0;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedId(variant.id)}
                disabled={outOfStock}
                className={cn(
                  "relative inline-flex flex-col items-start gap-1 rounded-none border px-5 py-3 text-left transition-all duration-300",
                  active
                    ? "border-ink bg-ink text-parchment"
                    : "border-ink/15 bg-transparent text-ink/85 hover:border-ink/50",
                  outOfStock && "opacity-40",
                )}
              >
                <span className="font-display text-lg leading-none">
                  {variant.size}
                </span>
                <span
                  className={cn(
                    "text-[9px] uppercase tracking-[0.28em]",
                    active ? "text-parchment/70" : "text-ink/50",
                  )}
                >
                  {formatSLE(variant.price)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={selected.stock === 0 || isAdding}
          onClick={addToCart}
          className="group relative inline-flex flex-1 items-center justify-center gap-3 overflow-hidden rounded-full bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] hover:bg-brand-gold hover:text-ink disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-parchment"
        >
          <span className="relative z-10">
            {selected.stock === 0
              ? "Sold out"
              : isAdding
                ? "Adding…"
                : "Add to bag"}
          </span>
          {selected.stock !== 0 && !isAdding && (
            <span className="relative z-10 inline-block transition-transform duration-500 group-hover:translate-x-1">
              →
            </span>
          )}
        </button>

        <button
          type="button"
          disabled={isToggling}
          onClick={toggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-full border px-6 py-4 text-[11px] uppercase tracking-[0.32em] transition-all duration-300",
            wishlisted
              ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
              : "border-ink/25 text-ink/75 hover:border-ink hover:text-ink",
          )}
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
            <path
              d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
              fill={wishlisted ? "currentColor" : "none"}
            />
          </svg>
          {wishlisted ? "Saved" : "Save"}
        </button>
      </div>

      <p className="border-t border-ink/12 pt-5 text-xs leading-relaxed text-ink/55">
        Complimentary express delivery on all orders. Each bottle ships
        hand-wrapped with a fragrance card from our atelier.
      </p>
    </div>
  );
}
