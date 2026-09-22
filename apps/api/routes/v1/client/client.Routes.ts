import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middleware/authMiddlware";
import { ClientController } from "./client.Controller";
import { ClientRespository } from "./clientRepository";
import { CloudinaryUpload } from "@repo/cloudinary";

const clientRouter = Router();


const clientRespository = new ClientRespository();
const uploadService = new CloudinaryUpload(); 
const clientController = new ClientController({ uploadService, clientRespository });


clientRouter.use(authMiddleware, requireRole(["CLIENT"]));
clientRouter.get("/me", clientController.GetProfileClient);
clientRouter.patch("/me", clientController.UpdateProfileClient);
clientRouter.get("/me/image/presignedUrl", clientController.GetPresignedUrl); 

export default clientRouter;