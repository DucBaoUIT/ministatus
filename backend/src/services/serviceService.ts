import { Prisma, ServiceStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";

export function listServices() {
  return prisma.service.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getServiceOrThrow(id: string) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    throw new ApiError(404, "SERVICE_NOT_FOUND", "Service not found");
  }
  return service;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  status?: ServiceStatus;
  uptime?: number;
  enabled?: boolean;
}

export function createService(input: CreateServiceInput) {
  if (!input.name || typeof input.name !== "string") {
    throw new ApiError(400, "VALIDATION_ERROR", "name is required");
  }
  return prisma.service.create({
    data: {
      name: input.name,
      description: input.description ?? "",
      status: input.status ?? "OPERATIONAL",
      uptime: input.uptime ?? 100,
      enabled: input.enabled ?? true,
    },
  });
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  status?: ServiceStatus;
  uptime?: number;
  enabled?: boolean;
}

export async function updateService(id: string, input: UpdateServiceInput) {
  await getServiceOrThrow(id);
  try {
    return await prisma.service.update({ where: { id }, data: input });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      throw new ApiError(404, "SERVICE_NOT_FOUND", "Service not found");
    }
    throw err;
  }
}

export async function deleteService(id: string) {
  await getServiceOrThrow(id);
  await prisma.service.delete({ where: { id } });
}
