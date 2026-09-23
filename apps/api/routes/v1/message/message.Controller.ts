import type { AuthRequest } from "../../../middleware/authMiddlware";
import { AsyncHandler } from "../../../shared/api.handler";
import type { Request, Response } from 'express';
import { AppError } from "../../../shared/api.error";
import { MessageCreateZodValidation } from "@repo/types";
import { prisma } from "@repo/db";
import { MessageRepository } from "./messageRepository";

interface IMessageController {
    messageRepository: MessageRepository
}

export class MessageController {
    private messageRepository: MessageRepository

    constructor({ messageRepository }: IMessageController) {
        this.messageRepository = messageRepository;
    }

    private async validateAccess(userId: string, conversationId: string) {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) throw new AppError("Conversation not found", 404);

        // Check if the user is the client or the therapist in this conversation
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { client: true, therapist: true }
        });

        if (!user) throw new AppError("User not found", 404);

        const isClient = user.client?.id === conversation.clientId;
        const isTherapist = user.therapist?.id === conversation.therapistId;

        if (!isClient && !isTherapist) {
            throw new AppError("Unauthorized access to this conversation", 403);
        }

        return true;
    }

    SendMessage = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);

        const conversationId = req.params.conversationId as string;
        if (!conversationId) throw new AppError("Conversation ID is required", 400);

        await this.validateAccess(userId, conversationId);

        const { data, success, error } = MessageCreateZodValidation.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid Schema",
                errors: error.issues
            });
        }

        const newMessage = await this.messageRepository.CreateMessage(conversationId, userId, data.content);

        return res.status(201).json({
            success: true,
            message: "Message sent",
            data: newMessage
        });
    });

    GetMessages = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);

        const conversationId = req.params.conversationId as string;
        if (!conversationId) throw new AppError("Conversation ID is required", 400);

        await this.validateAccess(userId, conversationId);

        const messages = await this.messageRepository.GetMessagesByConversation(conversationId);

        return res.status(200).json({
            success: true,
            data: messages
        });
    });
}
