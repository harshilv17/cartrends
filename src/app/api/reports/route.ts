import { prisma } from "@/lib/prisma";
import {
  computeEmployeeStats,
  type AttendanceRecord,
  type EmployeeRef,
} from "@/lib/analytics";

/** Turn a 2D array of values into a downloadable CSV string. */
function toCsv(rows: (string | number)[][]) {
  return rows.map((r) => r.join(",")).join("\n");
}

/**
 * GET /api/reports?type=attendance|productivity
 * Returns a CSV file as a download.
 */
export async function GET(req: Request) {
  const type = new URL(req.url).searchParams.get("type") ?? "attendance";

  const [employees, attendance] = await Promise.all([
    prisma.employee.findMany({ include: { department: true } }),
    prisma.attendance.findMany({ include: { employee: true }, orderBy: { date: "desc" } }),
  ]);

  let rows: (string | number)[][];
  let filename: string;

  if (type === "productivity") {
    // Per-employee productivity summary.
    const refs: EmployeeRef[] = employees.map((e) => ({
      id: e.id,
      name: e.name,
      department: e.department.name,
    }));
    const stats = computeEmployeeStats(refs, attendance as AttendanceRecord[]);

    rows = [
      ["Employee", "Department", "Working Days", "Total Hours", "Avg Hours", "Overtime Days", "Attendance %"],
      ...stats.map((s) => [
        s.name,
        s.department,
        s.workingDays,
        s.totalHours,
        s.avgHours,
        s.overtimeDays,
        s.attendancePct,
      ]),
    ];
    filename = "productivity-report.csv";
  } else {
    // Raw attendance log.
    rows = [
      ["Employee", "Date", "Check In", "Check Out", "Total Hours", "Status"],
      ...attendance.map((a) => [
        a.employee.name,
        new Date(a.date).toISOString().slice(0, 10),
        a.checkIn,
        a.checkOut,
        a.totalHours,
        a.status,
      ]),
    ];
    filename = "attendance-report.csv";
  }

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
