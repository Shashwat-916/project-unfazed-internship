
import type { AuthRequest } from "../../../middleware/authMiddlware";
import { AsyncHandler } from "../../../shared/api.handler";

import type { ClientRespository } from "./clientRepository";
import type { Request, Response } from 'express';
import { AppError } from "../../../shared/api.error";
import { CloudinaryUpload } from "@repo/cloudinary";


interface IClientConntroller {
    uploadService: CloudinaryUpload
    clientRespository: ClientRespository
}
export class ClientController {

    private uploadService: CloudinaryUpload
    private clientRespository: ClientRespository

    constructor({ uploadService, clientRespository }: IClientConntroller) {
        this.clientRespository = clientRespository
        this.uploadService = uploadService
    }


    GetProfileClient = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const clientProfile = await this.clientRespository.FindClientByUserId(userId);

        if (!clientProfile) {
            throw new AppError("Client profile not found", 404);
        }

        return res.status(200).json({
            success: true,
            data: clientProfile
        });
    })

    UpdateProfileClient = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }


        const updatedProfile = await this.clientRespository.UpdateClientByUserId(userId, req.body);

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedProfile
        });
    })

    GetPresignedUrl = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const signatureData = this.uploadService.generateSignature();

        return res.status(200).json({
            success: true,
            data: signatureData
        });
    })


}