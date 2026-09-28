import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middleware/authMiddlware";
import { TherapistController } from "./therapist.Controller";
import { TherapistRespository } from "./therapistRepository";
import { CloudinaryUpload, multerMemory } from "@repo/cloudinary";

const therapistRouter = Router();

const therapistRespository = new TherapistRespository();
const uploadService = new CloudinaryUpload(); 
const therapistController = new TherapistController({ uploadService, therapistRespository });

therapistRouter.get("/me/image/presignedUrl", therapistController.GetPresignedUrl); 

therapistRouter.use(authMiddleware, requireRole(["THERAPIST"]));

therapistRouter.get("/me", therapistController.GetProfileTherapist);
therapistRouter.patch("/me", therapistController.UpdateProfileTherapist);
therapistRouter.patch("/updatestatus", therapistController.UpdateStatus);
therapistRouter.post("/me/image/presignedUrl/db", therapistController.uploadPresignedUrl);
therapistRouter.post("/me/image/upload", multerMemory.single("file"), therapistController.uploadImage);

export default therapistRouter;
