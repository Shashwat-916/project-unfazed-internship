import { prisma } from "@repo/db";

export class ConversationRepository {
    async CreateConversation(clientId: string, therapistId: string) {
        // Check if conversation already exists
        const existing = await prisma.conversation.findFirst({
            where: {
                clientId,
                therapistId
            }
        });

        if (existing) return existing;

        return await prisma.conversation.create({
            data: {
                clientId,
                therapistId
            }
        });
    }

    async GetConversationsByClient(clientId: string) {
        return await prisma.conversation.findMany({
            where: { clientId },
            include: {
                therapist: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async GetConversationsByTherapist(therapistId: string) {
        return await prisma.conversation.findMany({
            where: { therapistId },
            include: {
                client: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async GetConversationById(conversationId: string) {
        return await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                client: {
                    include: { user: { select: { name: true, email: true } } }
                },
                therapist: {
                    include: { user: { select: { name: true, email: true } } }
                }
            }
        });
    }
}
