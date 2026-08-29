import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Service, ServiceStatus } from "../../types";

const STATUS_OPTIONS: ServiceStatus[] = ["OPERATIONAL", "DEGRADED", "PARTIAL_OUTAGE", "MAJOR_OUTAGE"];

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    return api.getServices().then(setServices);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function handleUpdate(id: string, patch: Partial<Service>) {
    const updated = await api.updateService(id, patch);
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  async function handleCreate() {
    const created = await api.createService({ name: "New Service", description: "", status: "OPERATIONAL", uptime: 100 });
    setServices((prev) => [...prev, created]);
  }

  async function handleDelete(id: string) {
    await api.deleteService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-base-200">Services</h1>
        <button
          onClick={handleCreate}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Add service
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-base-400">Loading\u2026</p>
      ) : (
        <div className="mt-6 space-y-4">
          {services.map((service) => (
            <ServiceRow key={service.id} service={service} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
          {services.length === 0 && <p className="text-sm text-base-400">No services yet.</p>}
        </div>
      )}
    </div>
  );
}

function ServiceRow({
  service,
  onUpdate,
  onDelete,
}: {
  service: Service;
  onUpdate: (id: string, patch: Partial<Service>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [uptime, setUptime] = useState(service.uptime);

  return (
    <div className="rounded-lg border border-base-700 bg-base-900 px-5 py-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_3fr_1fr]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name !== service.name && onUpdate(service.id, { name })}
          className="rounded-md border border-base-700 bg-base-850 px-3 py-1.5 text-sm text-base-200 focus:border-emerald-600 focus:outline-none"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => description !== service.description && onUpdate(service.id, { description })}
          className="rounded-md border border-base-700 bg-base-850 px-3 py-1.5 text-sm text-base-200 focus:border-emerald-600 focus:outline-none"
        />
        <input
          type="number"
          step="0.01"
          value={uptime}
          onChange={(e) => setUptime(Number(e.target.value))}
          onBlur={() => uptime !== service.uptime && onUpdate(service.id, { uptime })}
          className="rounded-md border border-base-700 bg-base-850 px-3 py-1.5 text-sm text-base-200 focus:border-emerald-600 focus:outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <select
          value={service.status}
          onChange={(e) => onUpdate(service.id, { status: e.target.value as ServiceStatus })}
          className="rounded-md border border-base-700 bg-base-850 px-3 py-1.5 text-sm text-base-200 focus:border-emerald-600 focus:outline-none"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-base-400">
            <input
              type="checkbox"
              checked={service.enabled}
              onChange={(e) => onUpdate(service.id, { enabled: e.target.checked })}
              className="h-4 w-4 rounded border-base-700 bg-base-850"
            />
            Enabled
          </label>
          <button onClick={() => onDelete(service.id)} className="text-sm text-red-400 hover:text-red-300">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
