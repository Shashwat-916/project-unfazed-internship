import { prisma } from "@repo/db";

export class NotificationRepository {
    async CreateNotification(userId: string, content: string) {
        return await prisma.notification.create({
            data: {
                userId,
                content
            }
        });
    }

    async GetNotificationsByUser(userId: string) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async MarkAsRead(id: string, userId: string) {
        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });

        if (!notification) return null;

        return await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
    }

    async MarkAllAsRead(userId: string) {
        return await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }

    async DeleteNotification(id: string, userId: string) {
        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });

        if (!notification) return null;

        return await prisma.notification.delete({
            where: { id }
        });
    }
}
