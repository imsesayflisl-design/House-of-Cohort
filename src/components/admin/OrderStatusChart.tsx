"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#9CA3AF",
  PAID: "#C9A84C",
  PROCESSING: "#3B82F6",
  SHIPPED: "#8B5CF6",
  DELIVERED: "#10B981",
  CANCELLED: "#EF4444",
};

export type StatusSlice = { status: string; count: number };

export function OrderStatusChart({ data }: { data: StatusSlice[] }) {
  const filtered = data.filter((d) => d.count > 0);

  if (filtered.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        No orders yet
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={filtered}
            dataKey="count"
            nameKey="status"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
          >
            {filtered.map((slice) => (
              <Cell
                key={slice.status}
                fill={STATUS_COLORS[slice.status] ?? "#9CA3AF"}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #ddd" }}
            formatter={(v, name) => [String(v ?? 0), String(name ?? "")]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
