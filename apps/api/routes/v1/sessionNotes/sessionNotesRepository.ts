import { prisma } from "@repo/db";

export class SessionNotesRepository {
    async CreateNote(therapistId: string, data: any) {
        return await prisma.sessionNote.create({
            data: {
                therapistId,
                ...data
            }
        });
    }

    async GetNoteById(id: string, therapistId: string) {
        return await prisma.sessionNote.findFirst({
            where: {
                id,
                therapistId
            },
            include: {
                client: {
                    select: {
                        user: { select: { name: true, email: true } }
                    }
                }
            }
        });
    }

    async GetNotesByTherapist(therapistId: string) {
        return await prisma.sessionNote.findMany({
            where: {
                therapistId
            },
            include: {
                client: {
                    select: {
                        user: { select: { name: true, email: true } }
                    }
                },
                appointment: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async GetNotesByClient(clientId: string, therapistId: string) {
        return await prisma.sessionNote.findMany({
            where: {
                clientId,
                therapistId
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async GetNotesByAppointment(appointmentId: string, therapistId: string) {
        return await prisma.sessionNote.findMany({
            where: {
                appointmentId,
                therapistId
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async GetSharedNotesByClient(clientId: string, appointmentId?: string) {
        // ENFORCEMENT: Only return SHARED notes to the client
        return await prisma.sessionNote.findMany({
            where: {
                clientId,
                type: "SHARED",
                ...(appointmentId ? { appointmentId } : {})
            },
            include: {
                therapist: {
                    select: {
                        user: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async UpdateNote(id: string, therapistId: string, data: any) {
        // Ensure the note belongs to the therapist before updating
        const note = await prisma.sessionNote.findFirst({
            where: { id, therapistId }
        });

        if (!note) return null;

        return await prisma.sessionNote.update({
            where: { id },
            data
        });
    }

    async DeleteNote(id: string, therapistId: string) {
        const note = await prisma.sessionNote.findFirst({
            where: { id, therapistId }
        });

        if (!note) return null;

        return await prisma.sessionNote.delete({
            where: { id }
        });
    }
}
