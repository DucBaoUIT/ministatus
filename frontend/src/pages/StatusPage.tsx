import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Incident, Service } from "../types";
import { OVERALL_STATUS_COPY, StatusBadge, overallStatus } from "../components/StatusBadge";

export default function StatusPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getServices(), api.getIncidents()])
      .then(([s, i]) => {
        setServices(s.filter((svc) => svc.enabled));
        setIncidents(i);
      })
      .catch(() => setError("Unable to reach the MiniStatus API."));
  }, []);

  const overall = services ? overallStatus(services) : "OPERATIONAL";

  return (
    <div className="min-h-screen bg-base-950">
      <header className="border-b border-base-700">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="flex items-center gap-2 text-sm font-mono text-base-400">
            <span className="status-dot bg-emerald-500" />
            MiniStatus
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-base-200">
            {services ? OVERALL_STATUS_COPY[overall] : "Loading status\u2026"}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-12">
        {error && (
          <div className="rounded-md border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-base-400">Services</h2>
          <div className="divide-y divide-base-700 rounded-lg border border-base-700 bg-base-900">
            {services?.map((service) => (
              <div key={service.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-medium text-base-200">{service.name}</p>
                  <p className="text-sm text-base-400">{service.description}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={service.status} />
                  <p className="mt-1 text-xs font-mono text-base-400">{service.uptime.toFixed(2)}% uptime</p>
                </div>
              </div>
            ))}
            {services && services.length === 0 && (
              <p className="px-5 py-6 text-sm text-base-400">No services configured yet.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-base-400">Incident History</h2>
          <div className="space-y-3">
            {incidents?.map((incident) => (
              <div key={incident.id} className="rounded-lg border border-base-700 bg-base-900 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-base-200">{incident.title}</p>
                  <span
                    className={`text-xs font-mono ${
                      incident.status === "RESOLVED" ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {incident.status}
                  </span>
                </div>
                {incident.description && <p className="mt-1 text-sm text-base-400">{incident.description}</p>}
                <p className="mt-2 text-xs font-mono text-base-400">
                  {new Date(incident.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
            {incidents && incidents.length === 0 && (
              <p className="text-sm text-base-400">No incidents reported.</p>
            )}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-3xl px-6 py-10 text-xs text-base-400">
        <Link to="/admin" className="hover:text-base-200">
          Admin dashboard &rarr;
        </Link>
      </footer>
    </div>
  );
}
