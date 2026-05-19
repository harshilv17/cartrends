"use client";

import { CalendarCheck, Download, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Report definitions — each links to the CSV export API.
const REPORTS = [
  {
    type: "attendance",
    title: "Attendance Report",
    description: "Full attendance log: check-in, check-out, hours and status for every record.",
    icon: CalendarCheck,
  },
  {
    type: "productivity",
    title: "Productivity Report",
    description: "Per-employee summary: working days, total hours, overtime and attendance rate.",
    icon: TrendingUp,
  },
];

export default function ReportsPage() {
  // Trigger a CSV file download from the reports API.
  function download(type: string) {
    window.open(`/api/reports?type=${type}`, "_blank");
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Export attendance and productivity data as CSV files."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {REPORTS.map(({ type, title, description, icon: Icon }) => (
          <Card key={type}>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => download(type)} className="w-full">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
