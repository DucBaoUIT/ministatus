import { Router } from "express";
import * as incidentController from "../controllers/incidentController";

export const incidentsRouter = Router();

incidentsRouter.get("/", incidentController.getIncidents);
incidentsRouter.get("/:id", incidentController.getIncident);
incidentsRouter.post("/", incidentController.postIncident);
incidentsRouter.patch("/:id", incidentController.patchIncident);
incidentsRouter.delete("/:id", incidentController.removeIncident);
