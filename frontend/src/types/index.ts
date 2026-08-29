export type ServiceStatus = "OPERATIONAL" | "DEGRADED" | "PARTIAL_OUTAGE" | "MAJOR_OUTAGE";

export interface Service {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  uptime: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus = "INVESTIGATING" | "IDENTIFIED" | "MONITORING" | "RESOLVED";

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface RuntimeInfo {
  app: string;
  version: string;
  environment: string;
  hostname: string;
  nodeVersion: string;
  platform: string;
  uptime: number;
  timestamp: string;
}
