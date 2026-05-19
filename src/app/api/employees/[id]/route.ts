import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/employees/[id] — update an employee's details.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, email, position, departmentId } = await req.json();

  const employee = await prisma.employee.update({
    where: { id },
    data: { name, email, position, departmentId },
    include: { department: true },
  });
  return NextResponse.json(employee);
}

// DELETE /api/employees/[id] — remove an employee (cascades attendance/timesheets).
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.employee.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
