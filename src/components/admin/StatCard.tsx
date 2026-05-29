import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
  accent?: "gold" | "warning";
}) {
  return (
    <Card
      className={cn(
        "border-l-4",
        accent === "warning" ? "border-l-amber-500" : "border-l-brand-gold",
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 font-serif text-3xl text-brand-black">{value}</p>
            {sublabel && (
              <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
            )}
          </div>
          {Icon && <Icon className="size-5 text-brand-gold/70" />}
        </div>
      </CardContent>
    </Card>
  );
}
