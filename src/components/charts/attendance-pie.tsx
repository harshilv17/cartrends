"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Colour per attendance status.
const COLORS: Record<string, string> = {
  PRESENT: "#2563eb",
  LATE: "#f59e0b",
  ABSENT: "#ef4444",
  HALF_DAY: "#8b5cf6",
};

// Pie chart of attendance status distribution.
export function AttendancePie({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((d) => (
            <Cell key={d.name} fill={COLORS[d.name] ?? "#94a3b8"} />
          ))}
        </Pie>
        <Tooltip />
        <Legend iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
