import { Router } from "express";
import * as serviceController from "../controllers/serviceController";

export const servicesRouter = Router();

servicesRouter.get("/", serviceController.getServices);
servicesRouter.get("/:id", serviceController.getService);
servicesRouter.post("/", serviceController.postService);
servicesRouter.patch("/:id", serviceController.patchService);
servicesRouter.delete("/:id", serviceController.removeService);
