import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// Coloured stat card shown in the dashboard KPI row.
export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  color = "blue",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  color?: "blue" | "green" | "amber" | "violet";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    violet: "bg-violet-100 text-violet-600",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", colors[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
