import { prisma } from "@repo/db";

export class ConversationManager {
    
    private static instance: ConversationManager;
    private conversations: Map<string, any>;
    
    private constructor() {
        this.conversations = new Map<string, any>();
    }

    static getInstance() {
        if (!ConversationManager.instance) {
            ConversationManager.instance = new ConversationManager();
        }
        return ConversationManager.instance;
    }

    async getOrCreateConversation(clientId: string, therapistId: string) {
        const cacheKey = `${clientId}_${therapistId}`;
        
        // 1. Check in-memory variable
        if (this.conversations.has(cacheKey)) {
            return this.conversations.get(cacheKey);
        }

        // 2. Try to find an existing conversation in DB
        let conversation = await prisma.conversation.findFirst({
            where: {
                clientId: clientId,
                therapistId: therapistId,
            }
        });

        // 3. Create if it doesn't exist
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    clientId: clientId,
                    therapistId: therapistId,
                }
            });
        }

        // 4. Save to in-memory variable
        this.conversations.set(cacheKey, conversation);

        return conversation;
    }
}