import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { RuntimeInfo } from "../../types";

export default function AdminRuntime() {
  const [runtime, setRuntime] = useState<RuntimeInfo | null>(null);

  useEffect(() => {
    const load = () => api.getRuntime().then(setRuntime).catch(() => {});
    load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="text-lg font-semibold text-base-200">Runtime</h1>
      <p className="mt-1 text-sm text-base-400">Live process and pod information, useful when debugging Kubernetes rollouts.</p>

      {!runtime ? (
        <p className="mt-6 text-sm text-base-400">Loading\u2026</p>
      ) : (
        <dl className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-base-700 bg-base-900 p-6 sm:grid-cols-2 font-mono text-sm">
          {Object.entries(runtime).map(([key, value]) => (
            <div key={key}>
              <dt className="text-xs uppercase tracking-wider text-base-400">{key}</dt>
              <dd className="mt-1 text-base-200 break-all">{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
