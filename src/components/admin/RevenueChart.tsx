"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { formatSLE } from "@/lib/utils";

export type RevenuePoint = { day: string; total: number };

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#666" }}
            tickFormatter={(d: string) =>
              new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
            }
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#666" }}
            tickFormatter={(v: number) => `${(v / 100).toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #ddd" }}
            formatter={(v) => [formatSLE(Number(v) || 0), "Revenue"]}
            labelFormatter={(label) =>
              typeof label === "string"
                ? new Date(label).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : String(label)
            }
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#C9A84C"
            strokeWidth={2}
            dot={{ r: 3, fill: "#C9A84C" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
