"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Upload } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

type Employee = { id: string; name: string };
type Attendance = {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: number;
  status: string;
  employee: { name: string };
};

const EMPTY = { employeeId: "", date: "", checkIn: "09:00", checkOut: "17:00" };

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual entry dialog state.
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  // CSV upload feedback message.
  const [uploadMsg, setUploadMsg] = useState("");

  async function load() {
    const [att, emp] = await Promise.all([
      fetch("/api/attendance").then((r) => r.json()),
      fetch("/api/employees").then((r) => r.json()),
    ]);
    setRecords(att);
    setEmployees(emp);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Submit a manual attendance entry.
  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setOpen(false);
      setForm(EMPTY);
      await load();
    } finally {
      setSaving(false);
    }
  }

  // Read a chosen CSV file and send its text to the upload API.
  async function handleCsv(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setUploadMsg("Uploading...");

    const csv = await file.text();
    const res = await fetch("/api/attendance/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const data = await res.json();

    if (!res.ok) {
      setUploadMsg(data.error ?? "Upload failed");
    } else {
      setUploadMsg(
        `Imported ${data.imported} rows.` +
          (data.skipped.length ? ` Skipped: ${data.skipped.join(", ")}` : "")
      );
      await load();
    }
    ev.target.value = "";
  }

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Upload a CSV or add attendance entries manually."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4" />
                Upload CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleCsv} />
              </label>
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </div>
        }
      />

      {/* CSV format hint + upload result */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">CSV Format</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="rounded bg-muted px-2 py-1 text-xs">
            employeeName,date,checkIn,checkOut,totalHours,status
          </code>
          {uploadMsg && <p className="mt-2 text-sm text-primary">{uploadMsg}</p>}
        </CardContent>
      </Card>

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
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.employee.name}</TableCell>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell>{r.checkIn}</TableCell>
                    <TableCell>{r.checkOut}</TableCell>
                    <TableCell>{r.totalHours} h</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Manual entry dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Attendance Entry</DialogTitle>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Check In</Label>
                <Input
                  type="time"
                  value={form.checkIn}
                  onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Check Out</Label>
                <Input
                  type="time"
                  value={form.checkOut}
                  onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Entry
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
