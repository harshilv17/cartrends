import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/employees — list all employees with their department.
export async function GET() {
  const employees = await prisma.employee.findMany({
    include: { department: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(employees);
}

// POST /api/employees — add a new employee.
export async function POST(req: Request) {
  const { name, email, position, departmentId } = await req.json();

  if (!name || !email || !position || !departmentId) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const employee = await prisma.employee.create({
    data: { name, email, position, departmentId },
    include: { department: true },
  });
  return NextResponse.json(employee, { status: 201 });
}
