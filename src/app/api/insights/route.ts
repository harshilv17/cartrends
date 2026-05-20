import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeDepartmentStats,
  computeEmployeeStats,
  generateInsights,
  type AttendanceRecord,
  type EmployeeRef,
  type Insight,
} from "@/lib/analytics";
import { generateAIInsights } from "@/lib/groq";

// Always fetch fresh — insights depend on the latest attendance data.
export const dynamic = "force-dynamic";

// GET /api/insights — Groq-powered insights with a rule-based fallback.
export async function GET() {
  const [employees, attendance] = await Promise.all([
    prisma.employee.findMany({ include: { department: true } }),
    prisma.attendance.findMany(),
  ]);

  const refs: EmployeeRef[] = employees.map((e) => ({
    id: e.id,
    name: e.name,
    department: e.department.name,
  }));

  const stats = computeEmployeeStats(refs, attendance as AttendanceRecord[]);
  const departments = computeDepartmentStats(stats);

  // Try the LLM first; fall back to rules if the API key is missing or fails.
  let insights: Insight[];
  let source: "groq" | "rules" = "rules";

  try {
    insights = await generateAIInsights(stats, departments);
    if (insights.length === 0) throw new Error("LLM returned no insights");
    source = "groq";
  } catch (err) {
    console.warn("Groq insights failed, using rule-based fallback:", err);
    insights = generateInsights(stats, departments);
  }

  return NextResponse.json({
    insights,
    source,
    employeeStats: stats,
    departmentStats: departments,
  });
}
