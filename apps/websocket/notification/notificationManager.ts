import { prisma } from "@repo/db";
import { EventEmitter } from "events";

export class NotificationManager {
    private static instance: NotificationManager;
    private broker: EventEmitter;
    
    private constructor() {
        this.broker = new EventEmitter();
    }

    static getInstance() {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    /**
     * Publishes a new notification.
     * Inserts into the database first, then emits an event via the local broker.
     */
    async publish(userId: string, content: string) {
        // 1. Save to database
        const notification = await prisma.notification.create({
            data: {
                userId,
                content,
            }
        });

        // 2. Publish event to local subscribers
        this.broker.emit(`notification:${userId}`, notification);
        
        return notification;
    }

    /**
     * Subscribes a user to their notifications stream.
     */
    subscribe(userId: string, callback: (notification: any) => void) {
        this.broker.on(`notification:${userId}`, callback);
    }

    /**
     * Unsubscribes a user from their notifications stream to prevent memory leaks.
     */
    unsubscribe(userId: string, callback: (notification: any) => void) {
        this.broker.off(`notification:${userId}`, callback);
    }

    /**
     * Marks a specific notification as read.
     */
    async markAsRead(notificationId: string) {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
}
