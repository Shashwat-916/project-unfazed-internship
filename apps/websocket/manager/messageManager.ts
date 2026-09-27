import { nanoid } from 'nanoid';
import { prisma } from '@repo/db';
import { userInstance } from './userManager';
import { WebSocket } from 'ws';

export class MessageManager {
    private static instance: MessageManager;

    public static getInstance(): MessageManager {
        if (!MessageManager.instance) {
           MessageManager.instance = new MessageManager();
        }
        return MessageManager.instance;
    }

    async handleMessage(userId: string, dataStr: string) {
        try {
            const parsedData = JSON.parse(dataStr);
            if (parsedData.type === "chat") {
                const { conversationId, content, recipientId } = parsedData;
                
                // 1. Create a nanoid for the message
                const messageId = nanoid();
                
                const payload = {
                    type: "new_message",
                    message: {
                        id: messageId,
                        content,
                        conversationId,
                        senderId: userId,
                        createdAt: new Date().toISOString()
                    }
                };

                // 2. Instantly send to the recipient if they are online
                if (recipientId) {
                    const recipient = userInstance.getUser(recipientId);
                    if (recipient && recipient.socket.readyState === WebSocket.OPEN) {
                        recipient.socket.send(JSON.stringify(payload));
                    }
                }

                // 3. Save to the database in the background
                prisma.message.create({
                    data: {
                        id: messageId,
                        content,
                        senderId: userId,
                        conversationId
                    }
                }).catch(err => console.error("Failed to save message to DB:", err));
            }
        } catch (e) {
            console.error("Message handling error:", e);
        }
    }
}

export const messageManager = MessageManager.getInstance();