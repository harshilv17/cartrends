"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Line chart of average working hours per week.
export function WeeklyLine({ data }: { data: { week: string; avgHours: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="avgHours"
          stroke="#2563eb"
          strokeWidth={3}
          dot={{ r: 4, fill: "#2563eb" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
