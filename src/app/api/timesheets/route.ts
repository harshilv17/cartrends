import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/timesheets — list timesheet entries, newest first.
export async function GET() {
  const timesheets = await prisma.timesheet.findMany({
    include: { employee: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(timesheets);
}

// POST /api/timesheets — log daily work hours against a project.
export async function POST(req: Request) {
  const { employeeId, date, project, task, hours } = await req.json();

  if (!employeeId || !date || !project || !task || hours == null) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const timesheet = await prisma.timesheet.create({
    data: { employeeId, date: new Date(date), project, task, hours: Number(hours) },
    include: { employee: true },
  });
  return NextResponse.json(timesheet, { status: 201 });
}
