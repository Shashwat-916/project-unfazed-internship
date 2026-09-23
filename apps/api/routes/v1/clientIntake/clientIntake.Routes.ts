import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middleware/authMiddlware";
import { ClientIntakeController } from "./clientIntake.Controller";
import { ClientIntakeRepository } from "./clientIntakeRepository";

const clientIntakeRouter = Router();

const clientIntakeRepository = new ClientIntakeRepository();
const clientIntakeController = new ClientIntakeController({ clientIntakeRepository });

clientIntakeRouter.use(authMiddleware, requireRole(["CLIENT"]));

clientIntakeRouter.get("/me", clientIntakeController.GetIntake);
clientIntakeRouter.post("/me", clientIntakeController.CreateIntake);
clientIntakeRouter.patch("/me", clientIntakeController.UpdateIntake);

export default clientIntakeRouter;
