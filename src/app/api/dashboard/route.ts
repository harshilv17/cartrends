import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeDepartmentStats,
  computeEmployeeStats,
  computeWeeklySummary,
  generateInsights,
  round,
  type AttendanceRecord,
  type EmployeeRef,
} from "@/lib/analytics";

// GET /api/dashboard — everything the dashboard page needs in one call.
export async function GET() {
  const [employees, attendance, timesheets] = await Promise.all([
    prisma.employee.findMany({ include: { department: true } }),
    prisma.attendance.findMany(),
    prisma.timesheet.findMany(),
  ]);

  const refs: EmployeeRef[] = employees.map((e) => ({
    id: e.id,
    name: e.name,
    department: e.department.name,
  }));

  const stats = computeEmployeeStats(refs, attendance as AttendanceRecord[]);
  const departmentStats = computeDepartmentStats(stats);
  const weekly = computeWeeklySummary(attendance as AttendanceRecord[]);
  const insights = generateInsights(stats, departmentStats);

  // ---- KPI cards ------------------------------------------------------------
  const totalEmployees = employees.length;
  const teamAvgHours = round(
    stats.length ? stats.reduce((s, e) => s + e.avgHours, 0) / stats.length : 0
  );
  const avgAttendance = round(
    stats.length ? stats.reduce((s, e) => s + e.attendancePct, 0) / stats.length : 0
  );
  const overtimeCount = stats.reduce((s, e) => s + e.overtimeDays, 0);

  // ---- Chart data -----------------------------------------------------------
  // Attendance status breakdown for the pie chart.
  const statusCounts = { PRESENT: 0, LATE: 0, ABSENT: 0, HALF_DAY: 0 } as Record<string, number>;
  for (const a of attendance) statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1;
  const statusBreakdown = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Hours logged per project for the bar chart.
  const projectHours: Record<string, number> = {};
  for (const t of timesheets) projectHours[t.project] = (projectHours[t.project] ?? 0) + t.hours;
  const projectBreakdown = Object.entries(projectHours).map(([project, hours]) => ({
    project,
    hours: round(hours),
  }));

  return NextResponse.json({
    kpis: { totalEmployees, teamAvgHours, avgAttendance, overtimeCount },
    employeeStats: stats,
    departmentStats,
    weekly,
    statusBreakdown,
    projectBreakdown,
    insights,
  });
}
