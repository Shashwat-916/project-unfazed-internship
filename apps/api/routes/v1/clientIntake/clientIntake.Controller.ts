import type { AuthRequest } from "../../../middleware/authMiddlware";
import { AsyncHandler } from "../../../shared/api.handler";
import type { Request, Response } from 'express';
import { AppError } from "../../../shared/api.error";
import { ClientIntakeUpdateZodValidation } from "@repo/types";
import { prisma } from "@repo/db";
import { ClientIntakeRepository } from "./clientIntakeRepository";

interface IClientIntakeController {
    clientIntakeRepository: ClientIntakeRepository
}

export class ClientIntakeController {

    private clientIntakeRepository: ClientIntakeRepository

    constructor({ clientIntakeRepository }: IClientIntakeController) {
        this.clientIntakeRepository = clientIntakeRepository;
    }

    GetIntake = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const intake = await this.clientIntakeRepository.GetByUserId(userId);

        if (!intake) {
            throw new AppError("Client intake not found", 404);
        }

        return res.status(200).json({
            success: true,
            data: intake
        });
    });

    CreateIntake = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const { data, success, error } = ClientIntakeUpdateZodValidation.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid Schema",
                errors: error.issues
            });
        }

        // First, verify client exists
        const client = await prisma.client.findUnique({
            where: { userId: userId }
        });

        if (!client) {
            throw new AppError("Client profile not found", 404);
        }

        // Check if intake already exists
        const existingIntake = await this.clientIntakeRepository.GetByUserId(userId);
        if (existingIntake) {
            throw new AppError("Intake already exists for this client", 400);
        }

        const newIntake = await this.clientIntakeRepository.CreateIntake(client.id, data);

        return res.status(201).json({
            success: true,
            message: "Intake form created successfully",
            data: newIntake
        });
    });

    UpdateIntake = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const { data, success, error } = ClientIntakeUpdateZodValidation.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid Schema",
                errors: error.issues
            });
        }

        const updatedIntake = await this.clientIntakeRepository.UpdateIntake(userId, data);

        return res.status(200).json({
            success: true,
            message: "Intake form updated successfully",
            data: updatedIntake
        });
    });
}
