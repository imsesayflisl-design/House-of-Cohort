"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
];

export function ProductSort() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("sort") ?? "newest";

  function onChange(next: string) {
    const sp = new URLSearchParams(params.toString());
    if (next === "newest") sp.delete("sort");
    else sp.set("sort", next);
    sp.delete("page");
    router.push(`/products?${sp.toString()}`);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Sort fragrances"
      className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-parchment p-1"
    >
      {OPTIONS.map((opt) => {
        const active = current === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.32em] transition-all duration-300 ${
              active
                ? "bg-ink text-parchment"
                : "text-ink/65 hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
