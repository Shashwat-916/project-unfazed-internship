import { Router } from "express";
import { AvailabilityController } from "./avalability.Controller";
import { AvailabilityService } from "./avalability.Service";
import { AvailabilityRespository } from "./avalability.Respository";
import { authMiddleware } from "../../../middleware/authMiddlware";

const availabilityRouter = Router();

const avalabilityRepository = new AvailabilityRespository();
const avalabilityService = new AvailabilityService(avalabilityRepository);
const availabilityController = new AvailabilityController({
    avalabilityService,
    avalabilityRepository
});

availabilityRouter.get("/time-slots", availabilityController.GetTimeSlots);
availabilityRouter.post("/create", authMiddleware, availabilityController.CreateAvalability);
availabilityRouter.get("/", authMiddleware, availabilityController.GetAvalability);
availabilityRouter.delete("/:availabilityId", authMiddleware, availabilityController.DeleteAvalability);

export { availabilityRouter };
