import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/enums";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-muted text-muted-foreground hover:bg-muted",
  PAID: "bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/20",
  PROCESSING: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  SHIPPED: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  DELIVERED: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  CANCELLED: "bg-red-100 text-red-700 hover:bg-red-100",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={cn("font-medium", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
