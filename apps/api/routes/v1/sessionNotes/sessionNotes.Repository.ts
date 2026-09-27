import { prisma } from "@repo/db";

export class SessionNotesRepository {
    async createNote(data: {
        appointmentId: string;
        therapistId: string;
        clientId: string;
        type: "PRIVATE" | "SHARED";
        format?: "FREEFORM" | "SOAP" | "DAP";
        content?: string;
        subjective?: string;
        objective?: string;
        assessment?: string;
        plan?: string;
        data?: string;
        intervention?: string;
    }) {
        return prisma.sessionNote.create({
            data,
        });
    }

    async updateNote(id: string, therapistId: string, data: any) {
        // Enforce that only the author therapist can update
        return prisma.sessionNote.updateMany({
            where: { id, therapistId },
            data,
        });
    }

    async getNotesByAppointmentForTherapist(appointmentId: string, therapistId: string) {
        return prisma.sessionNote.findMany({
            where: { appointmentId, therapistId },
            orderBy: { createdAt: "desc" }
        });
    }

    async getNotesByAppointmentForClient(appointmentId: string, clientId: string) {
        // ENFORCEMENT: Only return SHARED notes to the client
        return prisma.sessionNote.findMany({
            where: { 
                appointmentId, 
                clientId,
                type: "SHARED"
            },
            orderBy: { createdAt: "desc" }
        });
    }

    async getNoteById(id: string) {
        return prisma.sessionNote.findUnique({
            where: { id }
        });
    }
}
