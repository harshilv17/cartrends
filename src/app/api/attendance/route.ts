import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Work out the attendance status from check-in time and total hours. */
function deriveStatus(checkIn: string, totalHours: number) {
  if (totalHours <= 0) return "ABSENT";
  if (totalHours < 4) return "HALF_DAY";
  const [h, m] = checkIn.split(":").map(Number);
  return h * 60 + m > 9 * 60 + 15 ? "LATE" : "PRESENT"; // late after 09:15
}

// GET /api/attendance — list attendance records, newest first.
export async function GET() {
  const records = await prisma.attendance.findMany({
    include: { employee: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(records);
}

// POST /api/attendance — manual attendance entry for one employee/day.
export async function POST(req: Request) {
  const { employeeId, date, checkIn, checkOut } = await req.json();

  if (!employeeId || !date || !checkIn || !checkOut) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // Compute total hours from check-in / check-out.
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);
  const totalHours = Number((((outH * 60 + outM) - (inH * 60 + inM)) / 60).toFixed(2));

  const record = await prisma.attendance.create({
    data: {
      employeeId,
      date: new Date(date),
      checkIn,
      checkOut,
      totalHours,
      status: deriveStatus(checkIn, totalHours),
    },
    include: { employee: true },
  });
  return NextResponse.json(record, { status: 201 });
}
