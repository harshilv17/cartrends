/**
 * Seed script — fills the database with realistic dummy data so the
 * dashboard and insights have something to analyze out of the box.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---- Static reference data --------------------------------------------------

const DEPARTMENTS = ["Engineering", "Sales", "Marketing", "HR", "Design"];

const EMPLOYEES = [
  { name: "Rahul Sharma", email: "rahul@company.com", position: "Senior Developer", department: "Engineering" },
  { name: "Priya Verma", email: "priya@company.com", position: "Backend Developer", department: "Engineering" },
  { name: "Amit Patel", email: "amit@company.com", position: "Sales Executive", department: "Sales" },
  { name: "Sneha Iyer", email: "sneha@company.com", position: "Sales Manager", department: "Sales" },
  { name: "Karan Mehta", email: "karan@company.com", position: "Marketing Lead", department: "Marketing" },
  { name: "Divya Nair", email: "divya@company.com", position: "Content Strategist", department: "Marketing" },
  { name: "Vikram Singh", email: "vikram@company.com", position: "HR Generalist", department: "HR" },
  { name: "Ananya Rao", email: "ananya@company.com", position: "Product Designer", department: "Design" },
];

const PROJECTS = ["Mobile App", "Website Revamp", "CRM Integration", "Ad Campaign", "Onboarding Flow"];
const TASKS = ["Feature development", "Bug fixing", "Code review", "Client meeting", "Documentation", "Testing"];

// ---- Helpers ----------------------------------------------------------------

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/** Convert decimal hours to a "HH:MM" check-out time given a check-in. */
function addHours(time: string, hours: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + Math.round(hours * 60);
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.timesheet.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  // ---- Login accounts -------------------------------------------------------
  console.log("Creating users...");
  await prisma.user.createMany({
    data: [
      { name: "Admin", email: "admin@company.com", password: "admin123", role: "ADMIN" },
      { name: "Rahul Sharma", email: "rahul@company.com", password: "emp123", role: "EMPLOYEE" },
    ],
  });

  // ---- Departments ----------------------------------------------------------
  console.log("Creating departments...");
  const deptMap: Record<string, string> = {};
  for (const name of DEPARTMENTS) {
    const d = await prisma.department.create({ data: { name } });
    deptMap[name] = d.id;
  }

  // ---- Employees ------------------------------------------------------------
  console.log("Creating employees...");
  const employeeIds: string[] = [];
  for (const e of EMPLOYEES) {
    const emp = await prisma.employee.create({
      data: {
        name: e.name,
        email: e.email,
        position: e.position,
        departmentId: deptMap[e.department],
      },
    });
    employeeIds.push(emp.id);
  }

  // ---- Attendance + Timesheets for the last 21 days -------------------------
  console.log("Creating attendance & timesheets...");
  const today = new Date();

  for (let dayBack = 21; dayBack >= 1; dayBack--) {
    const date = new Date(today);
    date.setDate(today.getDate() - dayBack);
    const weekday = date.getDay();
    if (weekday === 0 || weekday === 6) continue; // skip weekends

    for (let i = 0; i < employeeIds.length; i++) {
      const empId = employeeIds[i];

      // 8% chance of being absent
      if (Math.random() < 0.08) {
        await prisma.attendance.create({
          data: { employeeId: empId, date, checkIn: "00:00", checkOut: "00:00", totalHours: 0, status: "ABSENT" },
        });
        continue;
      }

      // Employee 0 (Rahul) deliberately overworks -> burnout signal.
      const isOverworker = i === 0;
      // Employee 2 (Amit) is often late.
      const isLateProne = i === 2;

      const lateChance = isLateProne ? 0.5 : 0.15;
      const isLate = Math.random() < lateChance;

      const checkIn = isLate
        ? `09:${String(Math.floor(rand(20, 55))).padStart(2, "0")}`
        : `09:${String(Math.floor(rand(0, 12))).padStart(2, "0")}`;

      const hours = isOverworker ? rand(9.5, 11) : rand(7, 9);
      const checkOut = addHours(checkIn, hours);
      const status = hours < 4 ? "HALF_DAY" : isLate ? "LATE" : "PRESENT";

      await prisma.attendance.create({
        data: {
          employeeId: empId,
          date,
          checkIn,
          checkOut,
          totalHours: Number(hours.toFixed(2)),
          status,
        },
      });

      // Matching timesheet entry (work hours ~= attendance hours).
      await prisma.timesheet.create({
        data: {
          employeeId: empId,
          date,
          project: pick(PROJECTS),
          task: pick(TASKS),
          hours: Number((hours - rand(0, 1)).toFixed(2)),
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
