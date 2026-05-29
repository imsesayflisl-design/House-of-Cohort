"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { StarRatingInput } from "./StarRating";

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            rating,
            comment: comment.trim() || undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Could not submit review");
        }
        toast.success("Your letter has been received");
        setRating(0);
        setComment("");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-ink/15 bg-parchment-soft p-7"
    >
      <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
        Leave a letter
      </p>
      <h3 className="mt-3 font-display text-2xl font-light italic text-ink">
        Your impression in writing.
      </h3>

      <div className="mt-6">
        <StarRatingInput value={rating} onChange={setRating} size="lg" />
      </div>

      <label className="mt-6 block">
        <span className="text-[10px] uppercase tracking-[0.32em] text-ink/55">
          A few notes (optional)
        </span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did the fragrance recall? Where did you wear it?"
          rows={4}
          maxLength={1000}
          className="mt-2 w-full resize-none border-b border-ink/25 bg-transparent pb-2 font-serif text-base leading-relaxed text-ink placeholder:text-ink/35 focus:border-brand-gold focus:outline-none"
        />
      </label>

      <div className="mt-6 flex items-center justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 hover:bg-brand-gold hover:text-ink disabled:opacity-50"
        >
          {isPending ? "Sending…" : "Send the letter"}
          {!isPending && (
            <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
              →
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
