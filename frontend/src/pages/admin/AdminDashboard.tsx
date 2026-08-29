import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Incident, Service } from "../../types";
import { StatusBadge } from "../../components/StatusBadge";

export default function AdminDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    api.getServices().then(setServices).catch(() => {});
    api.getIncidents().then(setIncidents).catch(() => {});
  }, []);

  const avgUptime = services.length
    ? (services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2)
    : "0.00";
  const activeIncidents = incidents.filter((i) => i.status !== "RESOLVED").length;

  return (
    <div>
      <h1 className="text-lg font-semibold text-base-200">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Services" value={String(services.length)} />
        <StatCard label="Uptime" value={`${avgUptime}%`} />
        <StatCard label="Active Incidents" value={String(activeIncidents)} />
      </div>

      <h2 className="mt-10 mb-4 text-xs font-semibold uppercase tracking-wider text-base-400">Services</h2>
      <div className="divide-y divide-base-700 rounded-lg border border-base-700 bg-base-900">
        {services.map((service) => (
          <div key={service.id} className="flex items-center justify-between px-5 py-4">
            <p className="font-medium text-base-200">{service.name}</p>
            <StatusBadge status={service.status} />
          </div>
        ))}
        {services.length === 0 && <p className="px-5 py-6 text-sm text-base-400">No services yet.</p>}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-base-700 bg-base-900 px-5 py-4">
      <p className="text-xs uppercase tracking-wider text-base-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-base-200 font-mono">{value}</p>
    </div>
  );
}
