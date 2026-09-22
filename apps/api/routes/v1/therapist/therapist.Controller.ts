import type { AuthRequest } from "../../../middleware/authMiddlware";
import { AsyncHandler } from "../../../shared/api.handler";
import type { TherapistRespository } from "./therapistRepository";
import type { Request, Response } from 'express';
import { AppError } from "../../../shared/api.error";
import { CloudinaryUpload } from "@repo/cloudinary";
import { TherapistUpdateZodValidation } from "../../../../../packages/types/validations/therapist.types";


interface ITherapistConntroller {
    uploadService: CloudinaryUpload
    therapistRespository: TherapistRespository
}

export class TherapistController {

    private uploadService: CloudinaryUpload
    private therapistRespository: TherapistRespository

    constructor({ uploadService, therapistRespository }: ITherapistConntroller) {
        this.therapistRespository = therapistRespository
        this.uploadService = uploadService
    }


    GetProfileTherapist = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const therapistProfile = await this.therapistRespository.FindTherapistByUserId(userId);

        if (!therapistProfile) {
            throw new AppError("Therapist profile not found", 404);
        }

        return res.status(200).json({
            success: true,
            data: therapistProfile
        });
    })

    UpdateProfileTherapist = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const { data, success, error } = TherapistUpdateZodValidation.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid Schema",
                errors: error.issues
            });
        }

        const updatedProfile = await this.therapistRespository.UpdateTherapistByUserId(userId, data);

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
