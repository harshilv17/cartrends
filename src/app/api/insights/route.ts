import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeDepartmentStats,
  computeEmployeeStats,
  generateInsights,
  type AttendanceRecord,
  type EmployeeRef,
} from "@/lib/analytics";

// GET /api/insights — rule-based AI insights plus the stats they came from.
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
  const insights = generateInsights(stats, departments);

  return NextResponse.json({ insights, employeeStats: stats, departmentStats: departments });
}
