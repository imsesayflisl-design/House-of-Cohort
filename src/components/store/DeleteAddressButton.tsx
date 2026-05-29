"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteAddressButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/account/addresses/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Could not delete address");
        }
        toast("Address removed from the book");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-label="Delete address"
      className="font-display text-base italic text-ink/55 underline-offset-4 transition-colors hover:text-brand-rose hover:underline disabled:opacity-40"
    >
      remove
    </button>
  );
}
