import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middleware/authMiddlware";
import { ServiceController } from "./service.Controller";
import { ServiceRepository } from "./serviceRepository";

const serviceRouter = Router();

const serviceRepository = new ServiceRepository();
const serviceController = new ServiceController({ serviceRepository });


serviceRouter.use(authMiddleware, requireRole(["THERAPIST"]));

serviceRouter.post("/", serviceController.CreateService);
serviceRouter.get("/", serviceController.GetServices);
serviceRouter.get("/:id", serviceController.GetServiceById);
serviceRouter.patch("/:id", serviceController.UpdateService);
serviceRouter.delete("/:id", serviceController.DeleteService);

export default serviceRouter;
