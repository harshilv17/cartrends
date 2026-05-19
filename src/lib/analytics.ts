/**
 * Analytics & rule-based "AI" insight engine.
 *
 * No machine learning here — just plain statistics and simple rules.
 * Every function is pure: it takes raw records and returns computed numbers,
 * which keeps the logic easy to read and test.
 */

// ---- Shared types -----------------------------------------------------------

export type AttendanceRecord = {
  employeeId: string;
  date: string | Date;
  checkIn: string;
  checkOut: string;
  totalHours: number;
  status: string; // PRESENT | LATE | ABSENT | HALF_DAY
};

export type TimesheetRecord = {
  employeeId: string;
  date: string | Date;
  project: string;
  task: string;
  hours: number;
};

export type EmployeeRef = {
  id: string;
  name: string;
  department: string;
};

export type EmployeeStats = {
  id: string;
  name: string;
  department: string;
  workingDays: number; // days they showed up (not absent)
  absentDays: number;
  lateDays: number;
  totalHours: number;
  avgHours: number;
  overtimeDays: number; // days with > 9 logged hours
  attendancePct: number; // present (incl. late) / total days * 100
  punctualityPct: number; // on-time / working days * 100
};

// ---- Tunable rule constants -------------------------------------------------

export const STANDARD_DAY_HOURS = 8;
export const OVERTIME_THRESHOLD = 9; // hours/day above this counts as overtime
export const BURNOUT_AVG_HOURS = 9.2; // avg/day above this flags burnout risk

// ---- Per-employee statistics ------------------------------------------------

/** Build a stats row for every employee from raw attendance records. */
export function computeEmployeeStats(
  employees: EmployeeRef[],
  attendance: AttendanceRecord[]
): EmployeeStats[] {
  return employees.map((emp) => {
    const records = attendance.filter((a) => a.employeeId === emp.id);
    const totalDays = records.length;
    const absentDays = records.filter((r) => r.status === "ABSENT").length;
    const lateDays = records.filter((r) => r.status === "LATE").length;
    const workingDays = totalDays - absentDays;
    const totalHours = records.reduce((sum, r) => sum + r.totalHours, 0);
    const overtimeDays = records.filter((r) => r.totalHours > OVERTIME_THRESHOLD).length;
    const presentDays = totalDays - absentDays;

    return {
      id: emp.id,
      name: emp.name,
      department: emp.department,
      workingDays,
      absentDays,
      lateDays,
      totalHours: round(totalHours),
      avgHours: round(workingDays ? totalHours / workingDays : 0),
      overtimeDays,
      attendancePct: round(totalDays ? (presentDays / totalDays) * 100 : 0),
      punctualityPct: round(workingDays ? ((workingDays - lateDays) / workingDays) * 100 : 0),
    };
  });
}

// ---- Department statistics --------------------------------------------------

export type DepartmentStats = {
  department: string;
  employees: number;
  avgHours: number;
  avgAttendancePct: number;
  totalHours: number;
};

/** Aggregate employee stats up to the department level. */
export function computeDepartmentStats(stats: EmployeeStats[]): DepartmentStats[] {
  const groups: Record<string, EmployeeStats[]> = {};
  for (const s of stats) {
    (groups[s.department] ??= []).push(s);
  }

  return Object.entries(groups).map(([department, members]) => {
    const totalHours = members.reduce((sum, m) => sum + m.totalHours, 0);
    const avgHours = avg(members.map((m) => m.avgHours));
    const avgAttendancePct = avg(members.map((m) => m.attendancePct));
    return {
      department,
      employees: members.length,
      avgHours: round(avgHours),
      avgAttendancePct: round(avgAttendancePct),
      totalHours: round(totalHours),
    };
  });
}

// ---- Rule-based insight generation ------------------------------------------

export type Insight = {
  title: string;
  message: string;
  type: "positive" | "warning" | "info";
};

/**
 * Generate plain-English insights from computed stats.
 * Each block below is one simple rule.
 */
export function generateInsights(
  stats: EmployeeStats[],
  departments: DepartmentStats[]
): Insight[] {
  const insights: Insight[] = [];
  if (stats.length === 0) return insights;

  const teamAvgHours = avg(stats.map((s) => s.avgHours));

  // Rule 1 — most punctual employee.
  const punctual = [...stats].sort((a, b) => b.punctualityPct - a.punctualityPct)[0];
  insights.push({
    title: "Most Punctual Employee",
    message: `${punctual.name} is the most punctual with ${punctual.punctualityPct}% on-time arrivals.`,
    type: "positive",
  });

  // Rule 2 — frequent late arrivals.
  const lateMost = [...stats].sort((a, b) => b.lateDays - a.lateDays)[0];
  if (lateMost.lateDays >= 3) {
    insights.push({
      title: "Frequent Late Arrivals",
      message: `${lateMost.name} arrived late ${lateMost.lateDays} times — consider a check-in.`,
      type: "warning",
    });
  }

  // Rule 3 — team average working hours.
  insights.push({
    title: "Average Working Hours",
    message: `The team averages ${round(teamAvgHours)} working hours per day.`,
    type: "info",
  });

  // Rule 4 — burnout risk from sustained overtime.
  for (const s of stats) {
    if (s.avgHours >= BURNOUT_AVG_HOURS) {
      const pctOver = round(((s.avgHours - teamAvgHours) / teamAvgHours) * 100);
      insights.push({
        title: "Burnout Risk Detected",
        message: `${s.name} worked ${pctOver}% more hours than average and may be at burnout risk.`,
        type: "warning",
      });
    }
  }

  // Rule 5 — most productive department (by average hours).
  if (departments.length) {
    const topDept = [...departments].sort((a, b) => b.avgHours - a.avgHours)[0];
    insights.push({
      title: "Most Productive Department",
      message: `${topDept.department} leads with ${topDept.avgHours} avg hours per employee.`,
      type: "positive",
    });
  }

  // Rule 6 — low attendance warning.
  const lowAttendance = stats.filter((s) => s.attendancePct < 80);
  if (lowAttendance.length) {
    insights.push({
      title: "Low Attendance Alert",
      message: `${lowAttendance.map((s) => s.name).join(", ")} have attendance below 80%.`,
      type: "warning",
    });
  }

  return insights;
}

// ---- Weekly summary ---------------------------------------------------------

export type WeeklyPoint = { week: string; hours: number; avgHours: number };

/** Group total logged hours by ISO-ish week label for the line chart. */
export function computeWeeklySummary(attendance: AttendanceRecord[]): WeeklyPoint[] {
  const buckets: Record<string, { hours: number; days: number }> = {};

  for (const r of attendance) {
    if (r.status === "ABSENT") continue;
    const label = weekLabel(new Date(r.date));
    const b = (buckets[label] ??= { hours: 0, days: 0 });
    b.hours += r.totalHours;
    b.days += 1;
  }

  return Object.entries(buckets)
    .map(([week, b]) => ({
      week,
      hours: round(b.hours),
      avgHours: round(b.days ? b.hours / b.days : 0),
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

// ---- Small math helpers -----------------------------------------------------

export function round(n: number, decimals = 1) {
  return Number(n.toFixed(decimals));
}

function avg(nums: number[]) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

/** Return a "Wk of DD MMM" label for the Monday of the given date's week. */
function weekLabel(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
