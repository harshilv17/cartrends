"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { InsightCard } from "@/components/insight-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DepartmentStats, EmployeeStats, Insight } from "@/lib/analytics";

type InsightsData = {
  insights: Insight[];
  employeeStats: EmployeeStats[];
  departmentStats: DepartmentStats[];
};

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);

  useEffect(() => {
    fetch("/api/insights")
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

  const { insights, employeeStats, departmentStats } = data;

  return (
    <div>
      <PageHeader
        title="AI Insights"
        subtitle="Rule-based productivity and attendance analysis."
      />

      {/* Insight cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </CardContent>
      </Card>

      {/* Department productivity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Department Productivity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Avg Hours</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Avg Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentStats.map((d) => (
                <TableRow key={d.department}>
                  <TableCell className="font-medium">{d.department}</TableCell>
                  <TableCell>{d.employees}</TableCell>
                  <TableCell>{d.avgHours} h</TableCell>
                  <TableCell>{d.totalHours} h</TableCell>
                  <TableCell>{d.avgAttendancePct}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed employee stats */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Employee Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Working Days</TableHead>
                <TableHead>Avg Hours</TableHead>
                <TableHead>Late Days</TableHead>
                <TableHead>Overtime Days</TableHead>
                <TableHead>Punctuality</TableHead>
                <TableHead>Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeStats.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.workingDays}</TableCell>
                  <TableCell>{s.avgHours} h</TableCell>
                  <TableCell>{s.lateDays}</TableCell>
                  <TableCell>
                    {s.overtimeDays > 0 ? (
                      <Badge variant="warning">{s.overtimeDays}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>{s.punctualityPct}%</TableCell>
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
