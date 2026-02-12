"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";

type NumericColumnChartProps = {
  column: string;
  rows: Record<string, any>[];
};

export function NumericColumnChart({
  column,
  rows
}: NumericColumnChartProps) {
  const data = rows
    .map((row, index) => {
      const raw = row[column];
      const value = raw === "" || raw == null ? NaN : Number(raw);
      if (Number.isNaN(value) || !Number.isFinite(value)) return null;
      return { index, value };
    })
    .filter((d): d is { index: number; value: number } => d !== null);

  if (!data.length) {
    return (
      <p className="text-xs text-slate-500">
        No numeric data found for this column.
      </p>
    );
  }

  return (
    <div className="mt-3 h-48 rounded-lg border border-slate-800 bg-slate-950/50 px-2 py-1.5">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="index"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              borderColor: "#1f2937",
              borderRadius: 8,
              fontSize: 11
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

