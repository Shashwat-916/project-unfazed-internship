import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middleware/authMiddlware";
import { ClientController } from "./client.Controller";
import { ClientRespository } from "./clientRepository";
import { CloudinaryUpload, multerMemory } from "@repo/cloudinary";

const clientRouter = Router();


const clientRespository = new ClientRespository();
const uploadService = new CloudinaryUpload(); 
const clientController = new ClientController({ uploadService, clientRespository });


clientRouter.get("/me/image/presignedUrl", clientController.GetPresignedUrl); 
clientRouter.get("/findtherapist", clientController.FindAllTherapist);
clientRouter.get('/findtherapist/:slug', clientController.FindTherapistBySlug);

clientRouter.use(authMiddleware, requireRole(["CLIENT"]));
clientRouter.get("/me", clientController.GetProfileClient);
clientRouter.patch("/me", clientController.UpdateProfileClient);
clientRouter.patch("/updatestatus", clientController.UpdateStatus);
clientRouter.post("/me/image/presignedUrl/db", clientController.uploadPresignedUrl);
clientRouter.post("/me/image/upload", multerMemory.single("file"), clientController.uploadImage);

export default clientRouter;