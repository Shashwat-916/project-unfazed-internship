import type { AuthRequest } from "../../../middleware/authMiddlware";
import { AsyncHandler } from "../../../shared/api.handler";
import type { ServiceRepository } from "./serviceRepository";
import type { Request, Response } from 'express';
import { AppError } from "../../../shared/api.error";
import { CreateServiceValidation, UpdateServiceValidation } from "@repo/types";

interface IServiceController {
    serviceRepository: ServiceRepository
}

export class ServiceController {
    private serviceRepository: ServiceRepository

    constructor({ serviceRepository }: IServiceController) {
        this.serviceRepository = serviceRepository
    }

    CreateService = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const { data, success, error } = CreateServiceValidation.safeParse(req.body);
        if (!success) {
            return res.status(400).json({
                success: false,
                error: error.issues,
                message: "Invalid Schema",
            })
        }
        const newService = await this.serviceRepository.CreateService(userId, data);

        return res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: newService
        });
    })

    GetServices = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const services = await this.serviceRepository.GetServices(userId);

        return res.status(200).json({
            success: true,
            data: services
        });
    })

    GetServiceById = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        if (!id) {
            throw new AppError("Service ID is required", 400);
        }

        const service = await this.serviceRepository.GetServiceById(userId, id as string);

        return res.status(200).json({
            success: true,
            data: service
        });
    })

    UpdateService = AsyncHandler(async (req: AuthRequest, res: Response) => {
        
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        if (!id) {
            throw new AppError("Service ID is required", 400);
        }

        const {data , success , error } = UpdateServiceValidation.safeParse(req.body);
        if (!success) {
            return res.status(400).json({
                success: false,
                error: error.issues,
                message: "Invalid Schema",
            })
        }
        
        const updatedService = await this.serviceRepository.UpdateService(userId, id as string, data);

        return res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: updatedService
        });
    })

    DeleteService = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        if (!id) {
            throw new AppError("Service ID is required", 400);
        }

        await this.serviceRepository.DeleteService(userId, id as string);

        return res.status(200).json({
            success: true,
            message: "Service deleted successfully"
        });
    })
}
