import "dotenv/config";
import { createApp } from "./app";
import { config } from "./config";
import { prisma } from "./lib/prisma";

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      message: `ministatus backend listening on port ${config.port}`,
      environment: config.nodeEnv,
      version: config.appVersion,
    })
  );
});

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: "info", message: `Received ${signal}, shutting down gracefully` }));

  // 1. Stop accepting new connections / requests.
  server.close(async (err) => {
    if (err) {
      console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: "error", message: "Error closing HTTP server", err: String(err) }));
    }

    // 2. Close the database connection.
    try {
      await prisma.$disconnect();
    } catch (dbErr) {
      console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: "error", message: "Error disconnecting Prisma", err: String(dbErr) }));
    }

    // 3. Exit cleanly.
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: "info", message: "Shutdown complete" }));
    process.exit(0);
  });

  // Safety net: force-exit if shutdown hangs (e.g. a slow in-flight request).
  setTimeout(() => {
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: "error", message: "Forced shutdown after timeout" }));
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
