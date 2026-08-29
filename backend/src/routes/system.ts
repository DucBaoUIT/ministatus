import { Router } from "express";
import os from "node:os";
import { prisma } from "../lib/prisma";
import { config } from "../config";

export const systemRouter = Router();

// Liveness: is the process itself running and able to respond?
// Kubernetes livenessProbe should hit this. Keep it cheap and dependency-free
// so a slow/unavailable database does not cause the pod to be killed.
systemRouter.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Readiness: is the app ready to serve traffic (i.e. can it reach its
// dependencies)? Kubernetes readinessProbe should hit this so pods are
// removed from the Service's endpoints while the DB is unavailable.
systemRouter.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ready", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "not_ready", database: "disconnected" });
  }
});

// Runtime/debug info, useful when correlating behavior with a specific
// pod/replica/version during rolling updates.
systemRouter.get("/runtime", (req, res) => {
  res.status(200).json({
    app: config.appName,
    version: config.appVersion,
    environment: config.nodeEnv,
    hostname: os.hostname(),
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
