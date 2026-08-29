import express from "express";
import cors from "cors";
import { config } from "./config";
import { requestLogger } from "./middleware/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { systemRouter } from "./routes/system";
import { servicesRouter } from "./routes/services";
import { incidentsRouter } from "./routes/incidents";

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(requestLogger);

  app.use("/api", systemRouter);
  app.use("/api/services", servicesRouter);
  app.use("/api/incidents", incidentsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
