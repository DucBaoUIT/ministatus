import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.incident.deleteMany();
  await prisma.service.deleteMany();

  const website = await prisma.service.create({
    data: {
      name: "Website",
      description: "Frontend application",
      status: "OPERATIONAL",
      uptime: 99.98,
      enabled: true,
    },
  });

  const api = await prisma.service.create({
    data: {
      name: "API",
      description: "Backend REST API",
      status: "OPERATIONAL",
      uptime: 99.95,
      enabled: true,
    },
  });

  const database = await prisma.service.create({
    data: {
      name: "Database",
      description: "PostgreSQL primary database",
      status: "OPERATIONAL",
      uptime: 99.99,
      enabled: true,
    },
  });

  const k8s = await prisma.service.create({
    data: {
      name: "Kubernetes",
      description: "Cluster control plane and worker nodes",
      status: "OPERATIONAL",
      uptime: 99.9,
      enabled: true,
    },
  });

  await prisma.incident.create({
    data: {
      title: "API latency increased",
      description: "Elevated response times on the API were investigated and resolved.",
      severity: "MEDIUM",
      status: "RESOLVED",
      createdAt: new Date("2026-08-28T09:00:00Z"),
      updatedAt: new Date("2026-08-28T11:00:00Z"),
      resolvedAt: new Date("2026-08-28T11:00:00Z"),
    },
  });

  await prisma.incident.create({
    data: {
      title: "Database maintenance",
      description: "Scheduled maintenance window for the primary database.",
      severity: "LOW",
      status: "RESOLVED",
      createdAt: new Date("2026-08-21T02:00:00Z"),
      updatedAt: new Date("2026-08-21T03:00:00Z"),
      resolvedAt: new Date("2026-08-21T03:00:00Z"),
    },
  });

  console.log("Seed complete:", { website: website.id, api: api.id, database: database.id, k8s: k8s.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
