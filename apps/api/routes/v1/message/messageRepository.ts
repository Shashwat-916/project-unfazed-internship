import { prisma } from "@repo/db";

export class MessageRepository {
    async CreateMessage(conversationId: string, senderId: string, content: string) {
        return await prisma.message.create({
            data: {
                conversationId,
                senderId,
                content
            },
            include: {
                user: { select: { name: true, email: true } }
            }
        });
    }

    async GetMessagesByConversation(conversationId: string) {
        return await prisma.message.findMany({
            where: { conversationId },
            include: {
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
    }
}
