import { prisma } from "@repo/db";
import { type CreateAvailabilityInput } from '@repo/types'

export class AvailabilityRespository {

    async GetTherapistById(userId: string) {
        const therapist = await prisma.therapist.findFirst({
            where: {
                userId: userId
            }
        })
        return therapist
    }

    async CreateAvailability(data: CreateAvailabilityInput, therapistId: string) {
        return await prisma.avalability.create({
            data: {
                dayOfWeek: data.dayOfWeek,
                timeSlotId: data.timeSlotId,
                therapistId: therapistId
            }
        })
    }

    async GetAvailabilityByTherapist(therapistId: string, dayOfWeek?: any) {
        const query: any = { therapistId };
        if (dayOfWeek) {
            query.dayOfWeek = dayOfWeek;
        }
        return await prisma.avalability.findMany({
            where: query,
            include: { timeSlot: true }
        })
    }

    async GetAvailabilityById(id: string) {
        return await prisma.avalability.findUnique({ where: { id } })
    }

    async DeleteAvailability(id: string) {
        return await prisma.avalability.delete({ where: { id } })
    }

    async GetTimeSlots() {
        return await prisma.timeSlot.findMany({
            orderBy: { startTime: 'asc' }
        })
    }
}