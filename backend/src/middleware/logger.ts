import type { NextFunction, Request, Response } from "express";

// Minimal structured request logger. Writes one JSON line per request to
// stdout. In Kubernetes, stdout/stderr are collected by the container
// runtime, so we intentionally never write to a file here.
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const responseTimeMs = Number(end - start) / 1_000_000;

    const entry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: Math.round(responseTimeMs * 100) / 100,
    };

    process.stdout.write(JSON.stringify(entry) + "\n");
  });

  next();
}
