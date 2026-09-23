
import type { AuthRequest } from "../../../middleware/authMiddlware";
import { AsyncHandler } from "../../../shared/api.handler";

import type { ClientRespository } from "./clientRepository";
import type { Request, Response } from 'express';
import { AppError } from "../../../shared/api.error";
import { MinioUpload } from "@repo/minio";
import { ClientUpdateZodValidation } from "../../../../../packages/types/validations/client.types";
import { prisma } from "@repo/db";


interface IClientConntroller {
    uploadService: MinioUpload
    clientRespository: ClientRespository
}


interface Therapist {

}


export class ClientController {

    private uploadService: MinioUpload
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

    GetPresignedUrl = AsyncHandler(async (req: Request, res: Response) => {
        const signatureData = await this.uploadService.generateSignature();

        return res.status(200).json({
            success: true,
            data: signatureData
        });
    })

    uploadPresignedUrl = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const { url } = req.body;

        if (!url) {
            throw new AppError("Image URL is required", 400);
        }

        const updatedProfile = await this.clientRespository.UpdateClientByUserId(userId, { profileImage: url });

        return res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            data: updatedProfile
        });
    })


    FindAllTherapist = AsyncHandler(async (req: Request, res: Response) => {
        const BATCH_SIZE = 10;

        const totalTherapists = await prisma.therapist.count();

        const allTherapists: Therapist[] = [];

        for (let skip = 0; skip < totalTherapists; skip += BATCH_SIZE) {

            const therapists = await prisma.therapist.findMany({
                skip: skip,
                take: BATCH_SIZE,
                include: {
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            });

            allTherapists.push(...therapists);
        }

        return res.status(200).json({
            success: true,
            data: allTherapists,
        });
    });

    FindTherapistBySlug = AsyncHandler(async (req: Request, res: Response) => {
        const slug = req.params.slug as string;
        const therapist = await prisma.therapist.findUnique({
            where: {
                slug: slug
            }
        });

        if (!therapist) {
            return res.status(400).json({
                success: false,
                message: "Therapist Not Found"
            });
        }


        const [user, services, avalabilities] = await Promise.all([
            prisma.user.findUnique({
                where: { id: therapist.userId },
                select: { name: true, email: true }
            }),
            prisma.service.findMany({
                where: { therapistId: therapist.id }
            }),
            prisma.avalability.findMany({
                where: { therapistId: therapist.id },
                include: { timeSlot: true }
            })
        ]);

        const data = {
            ...therapist,
            user,
            services,
            avalabilities
        };

        return res.status(200).json({
            success: true,
            data
        });
    })


    UpdateStatus = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        const { status } = req.body;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        if (status !== 'ACTIVE' && status !== 'INACTIVE') {
            throw new AppError("Invalid status", 400);
        }

        const updatedProfile = await this.clientRespository.UpdateClientByUserId(userId, { status });

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: updatedProfile
        });
    });

}