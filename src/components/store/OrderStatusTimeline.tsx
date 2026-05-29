import { cn } from "@/lib/utils";

const FLOW = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
type Status = (typeof FLOW)[number] | "CANCELLED";

const LABELS: Record<(typeof FLOW)[number], string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Composing",
  SHIPPED: "On its way",
  DELIVERED: "Delivered",
};

export function OrderStatusTimeline({ status }: { status: Status }) {
  if (status === "CANCELLED") {
    return (
      <div className="border-l-2 border-brand-rose bg-brand-rose/8 px-5 py-3 font-serif text-base italic text-ink/75">
        This chapter was cancelled.
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(status);

  return (
    <ol className="grid grid-cols-5 gap-2">
      {FLOW.map((step, i) => {
        const reached = i <= currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step} className="flex flex-col items-center gap-3">
            <div className="relative flex w-full items-center">
              <span
                className={cn(
                  "absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 transition-colors",
                  i === 0
                    ? "ml-3"
                    : i === FLOW.length - 1
                      ? "mr-3"
                      : "",
                  reached ? "bg-brand-gold" : "bg-ink/12",
                )}
              />
              <span
                className={cn(
                  "relative mx-auto inline-flex size-3 rounded-full border transition-all duration-500",
                  active
                    ? "scale-150 border-brand-gold bg-brand-gold shadow-[0_0_0_4px_rgba(201,168,76,0.18)]"
                    : reached
                      ? "border-brand-gold bg-brand-gold"
                      : "border-ink/25 bg-parchment",
                )}
              />
            </div>
            <span
              className={cn(
                "text-center text-[10px] uppercase tracking-[0.32em]",
                reached ? "text-ink" : "text-ink/40",
              )}
            >
              {LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
