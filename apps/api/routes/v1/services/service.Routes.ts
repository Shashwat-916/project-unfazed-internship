import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middleware/authMiddlware";
import { ServiceController } from "./service.Controller";
import { ServiceRepository } from "./serviceRepository";

const serviceRouter = Router();

// Instantiate dependencies
const serviceRepository = new ServiceRepository();
const serviceController = new ServiceController({ serviceRepository });

// All service routes require authentication and the 'THERAPIST' role
// Assuming only therapists can manage services
serviceRouter.use(authMiddleware, requireRole(["THERAPIST"]));

serviceRouter.post("/", serviceController.CreateService);
serviceRouter.get("/", serviceController.GetServices);
serviceRouter.get("/:id", serviceController.GetServiceById);
serviceRouter.patch("/:id", serviceController.UpdateService);
serviceRouter.delete("/:id", serviceController.DeleteService);

export default serviceRouter;
