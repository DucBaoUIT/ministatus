import type { Incident, RuntimeInfo, Service } from "../types";

// Never hard-code the API origin: it's supplied via VITE_API_URL so the
// same build can point at a different backend per environment.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => undefined);

  if (!res.ok) {
    const message = body?.error?.message ?? res.statusText;
    throw new ApiClientError(res.status, message, body?.error?.code);
  }

  return body as T;
}

export const api = {
  getServices: () => request<Service[]>("/api/services"),
  getService: (id: string) => request<Service>(`/api/services/${id}`),
  createService: (data: Partial<Service>) =>
    request<Service>("/api/services", { method: "POST", body: JSON.stringify(data) }),
  updateService: (id: string, data: Partial<Service>) =>
    request<Service>(`/api/services/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteService: (id: string) => request<void>(`/api/services/${id}`, { method: "DELETE" }),

  getIncidents: () => request<Incident[]>("/api/incidents"),
  createIncident: (data: Partial<Incident>) =>
    request<Incident>("/api/incidents", { method: "POST", body: JSON.stringify(data) }),
  updateIncident: (id: string, data: Partial<Incident>) =>
    request<Incident>(`/api/incidents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteIncident: (id: string) => request<void>(`/api/incidents/${id}`, { method: "DELETE" }),

  getRuntime: () => request<RuntimeInfo>("/api/runtime"),
};

export { ApiClientError };
