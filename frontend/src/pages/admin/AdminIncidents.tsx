import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Incident, IncidentSeverity, IncidentStatus } from "../../types";

const SEVERITY_OPTIONS: IncidentSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUS_OPTIONS: IncidentStatus[] = ["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"];

export default function AdminIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIncidents().then(setIncidents).finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!title.trim()) return;
    const created = await api.createIncident({ title, severity: "LOW", status: "INVESTIGATING" });
    setIncidents((prev) => [created, ...prev]);
    setTitle("");
  }

  async function handleUpdate(id: string, patch: Partial<Incident>) {
    const updated = await api.updateIncident(id, patch);
    setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
  }

  async function handleDelete(id: string) {
    await api.deleteIncident(id);
    setIncidents((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-base-200">Incidents</h1>

      <div className="mt-6 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New incident title"
          className="flex-1 rounded-md border border-base-700 bg-base-850 px-3 py-1.5 text-sm text-base-200 focus:border-emerald-600 focus:outline-none"
        />
        <button
          onClick={handleCreate}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Create
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-base-400">Loading\u2026</p>
      ) : (
        <div className="mt-6 space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="rounded-lg border border-base-700 bg-base-900 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-base-200">{incident.title}</p>
                <button onClick={() => handleDelete(incident.id)} className="text-sm text-red-400 hover:text-red-300">
                  Delete
                </button>
              </div>
              <textarea
                defaultValue={incident.description}
                onBlur={(e) => e.target.value !== incident.description && handleUpdate(incident.id, { description: e.target.value })}
                rows={2}
                className="mt-2 w-full rounded-md border border-base-700 bg-base-850 px-3 py-1.5 text-sm text-base-200 focus:border-emerald-600 focus:outline-none"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <select
                  value={incident.severity}
                  onChange={(e) => handleUpdate(incident.id, { severity: e.target.value as IncidentSeverity })}
                  className="rounded-md border border-base-700 bg-base-850 px-3 py-1.5 text-sm text-base-200 focus:border-emerald-600 focus:outline-none"
                >
                  {SEVERITY_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  value={incident.status}
                  onChange={(e) => handleUpdate(incident.id, { status: e.target.value as IncidentStatus })}
                  className="rounded-md border border-base-700 bg-base-850 px-3 py-1.5 text-sm text-base-200 focus:border-emerald-600 focus:outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {incident.resolvedAt && (
                  <span className="text-xs font-mono text-base-400">
                    Resolved {new Date(incident.resolvedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
          {incidents.length === 0 && <p className="text-sm text-base-400">No incidents yet.</p>}
        </div>
      )}
    </div>
  );
}
