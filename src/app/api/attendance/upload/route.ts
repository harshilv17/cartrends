import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/attendance/upload — bulk import attendance from CSV text.
 *
 * Expected CSV columns (header row required):
 *   employeeName,date,checkIn,checkOut,totalHours,status
 *
 * Rows are matched to employees by name. Unknown names are skipped and
 * reported back so the user can fix their file.
 */
export async function POST(req: Request) {
  const { csv } = await req.json();
  if (!csv || typeof csv !== "string") {
    return NextResponse.json({ error: "No CSV content provided" }, { status: 400 });
  }

  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return NextResponse.json({ error: "CSV has no data rows" }, { status: 400 });
  }

  // Map employee names -> ids for quick lookup.
  const employees = await prisma.employee.findMany();
  const idByName = new Map(employees.map((e) => [e.name.toLowerCase(), e.id]));

  let imported = 0;
  const skipped: string[] = [];

  // Skip the header row (index 0).
  for (const line of lines.slice(1)) {
    const [name, date, checkIn, checkOut, totalHours, status] = line.split(",").map((c) => c.trim());
    const employeeId = idByName.get((name ?? "").toLowerCase());

    if (!employeeId) {
      skipped.push(name || "(empty)");
      continue;
    }

    await prisma.attendance.create({
      data: {
        employeeId,
        date: new Date(date),
        checkIn: checkIn || "00:00",
        checkOut: checkOut || "00:00",
        totalHours: Number(totalHours) || 0,
        status: status || "PRESENT",
      },
    });
    imported++;
  }

  return NextResponse.json({ imported, skipped });
}
