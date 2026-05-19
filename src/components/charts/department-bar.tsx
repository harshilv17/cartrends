"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Horizontal-style bar chart of average hours per department.
export function DepartmentBar({ data }: { data: { department: string; avgHours: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="department" tick={{ fontSize: 11 }} width={80} />
        <Tooltip />
        <Bar dataKey="avgHours" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
