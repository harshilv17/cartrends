import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/departments — list departments with employee counts.
export async function GET() {
  const departments = await prisma.department.findMany({
    include: { _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(departments);
}

// POST /api/departments — create a department.
export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const department = await prisma.department.create({ data: { name } });
  return NextResponse.json(department, { status: 201 });
}
