import { IncidentSeverity, IncidentStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";

export function listIncidents() {
  return prisma.incident.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getIncidentOrThrow(id: string) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) {
    throw new ApiError(404, "INCIDENT_NOT_FOUND", "Incident not found");
  }
  return incident;
}

export interface CreateIncidentInput {
  title: string;
  description?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
}

export function createIncident(input: CreateIncidentInput) {
  if (!input.title || typeof input.title !== "string") {
    throw new ApiError(400, "VALIDATION_ERROR", "title is required");
  }
  return prisma.incident.create({
    data: {
      title: input.title,
      description: input.description ?? "",
      severity: input.severity ?? "LOW",
      status: input.status ?? "INVESTIGATING",
    },
  });
}

export interface UpdateIncidentInput {
  title?: string;
  description?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
}

export async function updateIncident(id: string, input: UpdateIncidentInput) {
  await getIncidentOrThrow(id);
  const data: Prisma.IncidentUpdateInput = { ...input };

  // Automatically stamp resolvedAt when status transitions to RESOLVED,
  // and clear it if the incident is reopened.
  if (input.status === "RESOLVED") {
    data.resolvedAt = new Date();
  } else if (input.status && input.status !== "RESOLVED") {
    data.resolvedAt = null;
  }

  try {
    return await prisma.incident.update({ where: { id }, data });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      throw new ApiError(404, "INCIDENT_NOT_FOUND", "Incident not found");
    }
    throw err;
  }
}

export async function deleteIncident(id: string) {
  await getIncidentOrThrow(id);
  await prisma.incident.delete({ where: { id } });
}
