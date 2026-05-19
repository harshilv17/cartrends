import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/analytics";

// Single AI insight row — colour and icon depend on the insight type.
export function InsightCard({ insight }: { insight: Insight }) {
  const styles = {
    positive: { wrap: "bg-emerald-50 border-emerald-200", icon: "text-emerald-600", Icon: CheckCircle2 },
    warning: { wrap: "bg-amber-50 border-amber-200", icon: "text-amber-600", Icon: AlertTriangle },
    info: { wrap: "bg-blue-50 border-blue-200", icon: "text-blue-600", Icon: Info },
  }[insight.type];

  const { Icon } = styles;

  return (
    <div className={cn("flex gap-3 rounded-lg border p-4", styles.wrap)}>
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", styles.icon)} />
      <div>
        <p className="text-sm font-semibold">{insight.title}</p>
        <p className="text-sm text-muted-foreground">{insight.message}</p>
      </div>
    </div>
  );
}
