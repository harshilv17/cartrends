"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Bar chart of total hours logged per project.
export function ProjectBar({ data }: { data: { project: string; hours: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="project" tick={{ fontSize: 11 }} interval={0} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="hours" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={38} />
      </BarChart>
    </ResponsiveContainer>
  );
}
