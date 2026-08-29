import type { NextFunction, Request, Response } from "express";
import * as incidentService from "../services/incidentService";

export async function getIncidents(req: Request, res: Response, next: NextFunction) {
  try {
    const incidents = await incidentService.listIncidents();
    res.json(incidents);
  } catch (err) {
    next(err);
  }
}

export async function getIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const incident = await incidentService.getIncidentOrThrow(req.params.id);
    res.json(incident);
  } catch (err) {
    next(err);
  }
}

export async function postIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const incident = await incidentService.createIncident(req.body);
    res.status(201).json(incident);
  } catch (err) {
    next(err);
  }
}

export async function patchIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const incident = await incidentService.updateIncident(req.params.id, req.body);
    res.json(incident);
  } catch (err) {
    next(err);
  }
}

export async function removeIncident(req: Request, res: Response, next: NextFunction) {
  try {
    await incidentService.deleteIncident(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
