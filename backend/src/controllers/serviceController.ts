import type { NextFunction, Request, Response } from "express";
import * as serviceService from "../services/serviceService";

export async function getServices(req: Request, res: Response, next: NextFunction) {
  try {
    const services = await serviceService.listServices();
    res.json(services);
  } catch (err) {
    next(err);
  }
}

export async function getService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await serviceService.getServiceOrThrow(req.params.id);
    res.json(service);
  } catch (err) {
    next(err);
  }
}

export async function postService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await serviceService.createService(req.body);
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
}

export async function patchService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await serviceService.updateService(req.params.id, req.body);
    res.json(service);
  } catch (err) {
    next(err);
  }
}

export async function removeService(req: Request, res: Response, next: NextFunction) {
  try {
    await serviceService.deleteService(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
