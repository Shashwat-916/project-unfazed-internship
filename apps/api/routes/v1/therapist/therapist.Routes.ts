import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middleware/authMiddlware";
import { TherapistController } from "./therapist.Controller";
import { TherapistRespository } from "./therapistRepository";
import { CloudinaryUpload } from "@repo/cloudinary";

const therapistRouter = Router();

const therapistRespository = new TherapistRespository();
const uploadService = new CloudinaryUpload(); 
const therapistController = new TherapistController({ uploadService, therapistRespository });

therapistRouter.use(authMiddleware, requireRole(["THERAPIST"]));

therapistRouter.get("/me", therapistController.GetProfileTherapist);
therapistRouter.patch("/me", therapistController.UpdateProfileTherapist);
therapistRouter.get("/me/image/presignedUrl", therapistController.GetPresignedUrl); 

export default therapistRouter;
