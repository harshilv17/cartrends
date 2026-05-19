"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

type Employee = { id: string; name: string };
type Timesheet = {
  id: string;
  date: string;
  project: string;
  task: string;
  hours: number;
  employee: { name: string };
};

const EMPTY = { employeeId: "", date: "", project: "", task: "", hours: "8" };

export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [ts, emp] = await Promise.all([
      fetch("/api/timesheets").then((r) => r.json()),
      fetch("/api/employees").then((r) => r.json()),
    ]);
    setTimesheets(ts);
    setEmployees(emp);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Submit a new timesheet entry.
  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/timesheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, hours: Number(form.hours) }),
      });
      setOpen(false);
      setForm(EMPTY);
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Timesheets"
        subtitle="Log daily work hours against projects and tasks."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Log Hours
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.employee.name}</TableCell>
                    <TableCell>{formatDate(t.date)}</TableCell>
                    <TableCell>
                      <Badge variant="muted">{t.project}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t.task}</TableCell>
                    <TableCell>{t.hours} h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add timesheet dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Work Hours</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                required
              >
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Input
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                placeholder="e.g. Mobile App"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Task Description</Label>
              <Input
                value={form.task}
                onChange={(e) => setForm({ ...form, task: e.target.value })}
                placeholder="e.g. Bug fixing"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hours Worked</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Entry
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
