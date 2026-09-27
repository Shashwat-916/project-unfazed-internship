import { prisma } from "@repo/db";


export class AppointmentRespository {


    async GetClientByUserId(userId :string) {

        const client = await prisma.client.findUnique({
            where:{
                userId
            }
        })

        return client

    }

    async GetTherapistByUserId(userId: string) {
        return prisma.therapist.findUnique({
            where: {
                userId
            }
        });
    }

    async GetTherapistById(id: string) {
        return prisma.therapist.findUnique({ where: { id } });
    }

    async GetServiceById(id: string) {
        return prisma.service.findUnique({ where: { id } });
    }

    async GetTimeSlotById(id: number) {
        return prisma.timeSlot.findUnique({ where: { id } });
    }

    async checkIfBooked(therapistId: string, date: Date, startTime: Date, endTime: Date) {
        return prisma.bookedAppointment.findFirst({
            where: {
                therapistId,
                date,
                startTime,
                endTime
            }
        });
    }

    

    async getAppointmentsByTherapist(therapistId: string) {
        return prisma.appointment.findMany({
            where: { therapistId },
            include: {
                client: {
                    include: {
                        user: {
                            select: { name: true }
                        },
                        intake: true
                    }
                },
                service: true
            }
        });
    }

    async getAppointmentsByClient(clientId: string) {
        return prisma.appointment.findMany({
            where: { clientId },
            include: {
                therapist: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                service: true
            }
        });
    }
}