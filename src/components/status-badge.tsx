import { Badge } from "@/components/ui/badge";

// Map an attendance status string to a coloured badge.
export function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "PRESENT"
      ? "success"
      : status === "LATE"
        ? "warning"
        : status === "ABSENT"
          ? "danger"
          : "default";

  const label = status.replace("_", " ");
  return <Badge variant={variant}>{label}</Badge>;
}
