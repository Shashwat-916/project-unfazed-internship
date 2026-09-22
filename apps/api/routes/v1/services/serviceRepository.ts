import { prisma } from "@repo/db";
import { AppError } from "../../../shared/api.error";
import type { CreateServiceInput, UpdateServiceInput } from "@repo/types";

export class ServiceRepository {

    private async getTherapistId(userId: string) {
        const therapist = await prisma.therapist.findUnique({
            where: {userId : userId}
        });
        console.log("Here inside this service repo")
        if (!therapist) {
            throw new AppError("Therapist profile not found", 404);
        }
        return therapist.id;
    }

    

    async CreateService(userId: string, data: Omit<CreateServiceInput, "therapistId">) {
        const therapistId = await this.getTherapistId(userId);
        const service = await prisma.service.create({
            data: {
                ...data,
                therapistId
            }
        });
        return service;
    }

    async GetServices(userId: string) {
        const therapistId = await this.getTherapistId(userId);
        const services = await prisma.service.findMany({
            where: { therapistId }
        });
        return services;
    }

    async GetServiceById(userId: string, serviceId: string) {
        const therapistId = await this.getTherapistId(userId);
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });
        if (!service || service.therapistId !== therapistId) {
            throw new AppError("Service not found", 404);
        }
        return service;
    }

    async UpdateService(userId: string, serviceId: string, data: UpdateServiceInput) {
        const therapistId = await this.getTherapistId(userId);
        
        const existingService = await prisma.service.findUnique({
            where: { id: serviceId }
        });
        if (!existingService || existingService.therapistId !== therapistId) {
            throw new AppError("Service not found or unauthorized", 404);
        }

        const service = await prisma.service.update({
            where: { id: serviceId },
            data
        });
        return service;
    }

    async DeleteService(userId: string, serviceId: string) {
        const therapistId = await this.getTherapistId(userId);
        
        const existingService = await prisma.service.findUnique({
            where: { id: serviceId }
        });
        if (!existingService || existingService.therapistId !== therapistId) {
            throw new AppError("Service not found or unauthorized", 404);
        }

        await prisma.service.delete({
            where: { id: serviceId }
        });
        return true;
    }
}
