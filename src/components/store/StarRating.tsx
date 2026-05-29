"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const SIZE_CLASS: Record<Size, string> = {
  sm: "size-3.5",
  md: "size-[18px]",
  lg: "size-6",
};

function Star({
  filled,
  size = "md",
  className,
}: {
  filled: boolean;
  size?: Size;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        SIZE_CLASS[size],
        filled ? "text-brand-gold" : "text-ink/22",
        className,
      )}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.1}
      aria-hidden
    >
      <path
        d="M12 3.2l2.6 5.6 6.1.6-4.6 4.2 1.4 6L12 16.7 6.5 19.6l1.4-6L3.3 9.4l6.1-.6L12 3.2z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarRatingDisplay({
  value,
  size = "md",
  className,
}: {
  value: number;
  size?: Size;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= Math.round(value)} size={size} />
      ))}
    </div>
  );
}

export function StarRatingInput({
  value,
  onChange,
  size = "md",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  size?: Size;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const displayed = hover ?? value;

  return (
    <div
      className={cn("inline-flex items-center gap-1.5", className)}
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= displayed;
        return (
          <button
            key={n}
            type="button"
            aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            className="rounded-sm p-0.5 transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-brand-gold"
          >
            <Star filled={filled} size={size} />
          </button>
        );
      })}
    </div>
  );
}
