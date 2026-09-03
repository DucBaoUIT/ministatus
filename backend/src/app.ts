import express from "express";
import cors from "cors";
import client from "prom-client";

import { config } from "./config";
import { requestLogger } from "./middleware/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { systemRouter } from "./routes/system";
import { servicesRouter } from "./routes/services";
import { incidentsRouter } from "./routes/incidents";

// Collect Node.js process metrics:
// CPU, memory, event loop, GC, process uptime, etc.
client.collectDefaultMetrics();

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
});

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  // Prometheus metrics endpoint.
  // Keep this before application routes so Prometheus can scrape it.
  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  });

  // HTTP metrics middleware.
  app.use((req, res, next) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      const duration =
        Number(process.hrtime.bigint() - start) / 1_000_000_000;

      const route = req.route
        ? `${req.baseUrl}${req.route.path}`
        : "unknown";

      const labels = {
        method: req.method,
        route,
        status_code: String(res.statusCode),
      };

      httpRequestsTotal.inc(labels);
      httpRequestDuration.observe(labels, duration);
    });

    next();
  });

  app.use(requestLogger);

  app.use("/api", systemRouter);
  app.use("/api/services", servicesRouter);
  app.use("/api/incidents", incidentsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
