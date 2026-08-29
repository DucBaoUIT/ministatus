import type { ServiceStatus } from "../types";

const STATUS_META: Record<ServiceStatus, { label: string; dot: string; text: string }> = {
  OPERATIONAL: { label: "Operational", dot: "bg-emerald-500", text: "text-emerald-400" },
  DEGRADED: { label: "Degraded", dot: "bg-amber-500", text: "text-amber-400" },
  PARTIAL_OUTAGE: { label: "Partial outage", dot: "bg-orange-500", text: "text-orange-400" },
  MAJOR_OUTAGE: { label: "Major outage", dot: "bg-red-500", text: "text-red-400" },
};

export function StatusBadge({ status }: { status: ServiceStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${meta.text}`}>
      <span className={`status-dot ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function overallStatus(services: { status: ServiceStatus; enabled: boolean }[]): ServiceStatus {
  const active = services.filter((s) => s.enabled);
  if (active.some((s) => s.status === "MAJOR_OUTAGE")) return "MAJOR_OUTAGE";
  if (active.some((s) => s.status === "PARTIAL_OUTAGE")) return "PARTIAL_OUTAGE";
  if (active.some((s) => s.status === "DEGRADED")) return "DEGRADED";
  return "OPERATIONAL";
}

export const OVERALL_STATUS_COPY: Record<ServiceStatus, string> = {
  OPERATIONAL: "All systems operational",
  DEGRADED: "Some systems degraded",
  PARTIAL_OUTAGE: "Partial outage",
  MAJOR_OUTAGE: "Major outage",
};
