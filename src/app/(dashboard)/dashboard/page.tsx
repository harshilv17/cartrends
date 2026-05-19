"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2, Sparkles, TrendingUp, UserCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { InsightCard } from "@/components/insight-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendancePie } from "@/components/charts/attendance-pie";
import { ProjectBar } from "@/components/charts/project-bar";
import { WeeklyLine } from "@/components/charts/weekly-line";
import { DepartmentBar } from "@/components/charts/department-bar";
import type { DepartmentStats, EmployeeStats, Insight, WeeklyPoint } from "@/lib/analytics";

// Shape of the /api/dashboard response.
type DashboardData = {
  kpis: { totalEmployees: number; teamAvgHours: number; avgAttendance: number; overtimeCount: number };
  employeeStats: EmployeeStats[];
  departmentStats: DepartmentStats[];
  weekly: WeeklyPoint[];
  statusBreakdown: { name: string; value: number }[];
  projectBreakdown: { project: string; hours: number }[];
  insights: Insight[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { kpis, weekly, departmentStats, employeeStats, statusBreakdown, projectBreakdown, insights } = data;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Attendance and productivity overview at a glance." />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Employees" value={kpis.totalEmployees} icon={Users} color="blue" />
        <KpiCard
          label="Avg Working Hours"
          value={`${kpis.teamAvgHours} h`}
          icon={Clock}
          color="green"
          hint="per employee / day"
        />
        <KpiCard
          label="Avg Attendance"
          value={`${kpis.avgAttendance}%`}
          icon={UserCheck}
          color="violet"
        />
        <KpiCard
          label="Overtime Days"
          value={kpis.overtimeCount}
          icon={TrendingUp}
          color="amber"
          hint="total flagged"
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendancePie data={statusBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hours by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectBar data={projectBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Productivity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyLine data={weekly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Hours by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentBar data={departmentStats} />
          </CardContent>
        </Card>
      </div>

      {/* AI insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </CardContent>
      </Card>

      {/* Employee statistics table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Employee Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Avg Hours</TableHead>
                <TableHead>Late Days</TableHead>
                <TableHead>Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeStats.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell>{s.avgHours} h</TableCell>
                  <TableCell>{s.lateDays}</TableCell>
                  <TableCell>
                    <Badge variant={s.attendancePct >= 90 ? "success" : s.attendancePct >= 80 ? "warning" : "danger"}>
                      {s.attendancePct}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
