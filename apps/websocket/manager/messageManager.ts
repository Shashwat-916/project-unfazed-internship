import { prisma } from "@repo/db";
import { ConversationManager } from "./conversationManger";
import { UserManager } from "./userManager";
import type { MessagePayload, Role } from "../types";

export class MessageManager {
    private static instance: MessageManager;
    private messages: Map<string, any[]>;
    
    private constructor() {
        this.messages = new Map<string, any[]>();
    }

    static getInstance() {
        if (!MessageManager.instance) {
            MessageManager.instance = new MessageManager();
        }
        return MessageManager.instance;
    }

    async handleMessage(senderId: string, senderRole: Role, payload: MessagePayload) {
        const conversationManager = ConversationManager.getInstance();
        const userManager = UserManager.getInstance();
        
        const clientId = senderRole === "CLIENT" ? senderId : payload.recipientId;
        const therapistId = senderRole === "THERAPIST" ? senderId : payload.recipientId;

        // 1. Get or create conversation
        const conversation = await conversationManager.getOrCreateConversation(clientId, therapistId);

        // 2. Await DB save first so we get the correct ID
        const savedMessage = await prisma.message.create({
            data: {
                content: payload.content,
                senderId: senderId,
                conversationId: conversation.id,
            }
        });

        // 3. Save to in-memory variable using the real database object
        if (!this.messages.has(conversation.id)) {
            this.messages.set(conversation.id, []);
        }
        this.messages.get(conversation.id)?.push(savedMessage);

        // 4. Deliver if online
        const recipient = userManager.getUser(payload.recipientId);
        
        if (recipient && recipient.ws) {
            recipient.ws.send(JSON.stringify({
                type: 'MESSAGE',
                data: savedMessage
            }));
        }
    }
}