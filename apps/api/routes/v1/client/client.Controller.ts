
import type { AuthRequest } from "../../../middleware/authMiddlware";
import { AsyncHandler } from "../../../shared/api.handler";

import type { ClientRespository } from "./clientRepository";
import type { Request, Response } from 'express';
import { AppError } from "../../../shared/api.error";
import { CloudinaryUpload } from "@repo/cloudinary";
import { ClientUpdateZodValidation } from "../../../../../packages/types/validations/client.types";


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

        const { data, success, error } = ClientUpdateZodValidation.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid Schema",
                errors: error.issues
            });
        }

        const updatedProfile = await this.clientRespository.UpdateClientByUserId(userId, data);

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