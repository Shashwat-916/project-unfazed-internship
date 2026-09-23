import type { AuthRequest } from "../../../middleware/authMiddlware";
import { AsyncHandler } from "../../../shared/api.handler";
import type { Request, Response } from 'express';
import { AppError } from "../../../shared/api.error";
import { ConversationCreateZodValidation } from "@repo/types";
import { prisma } from "@repo/db";
import { ConversationRepository } from "./conversationRepository";

interface IConversationController {
    conversationRepository: ConversationRepository
}

export class ConversationController {
    private conversationRepository: ConversationRepository

    constructor({ conversationRepository }: IConversationController) {
        this.conversationRepository = conversationRepository;
    }

    private async getProfileId(userId: string, role: string) {
        if (role === "THERAPIST") {
            const therapist = await prisma.therapist.findUnique({ where: { userId } });
            if (!therapist) throw new AppError("Therapist profile not found", 404);
            return { profileId: therapist.id, type: "THERAPIST" };
        } else if (role === "CLIENT") {
            const client = await prisma.client.findUnique({ where: { userId } });
            if (!client) throw new AppError("Client profile not found", 404);
            return { profileId: client.id, type: "CLIENT" };
        }
        throw new AppError("Invalid role for conversation", 403);
    }

    CreateConversation = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const { data, success, error } = ConversationCreateZodValidation.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid Schema",
                errors: error.issues
            });
        }

        const userId = req.user?.userId;
        const role = req.user?.role;
        if (!userId || !role) throw new AppError("Unauthorized", 401);

        const { profileId, type } = await this.getProfileId(userId, role);
        
        let finalClientId = data.clientId;
        let finalTherapistId = data.therapistId;

        if (type === "CLIENT") {
            finalClientId = profileId;
        } else if (type === "THERAPIST") {
            finalTherapistId = profileId;
        }

        if (!finalClientId || !finalTherapistId) {
            return res.status(400).json({
                success: false,
                message: "Both clientId and therapistId must be provided or inferable."
            });
        }

        const conversation = await this.conversationRepository.CreateConversation(finalClientId, finalTherapistId);

        return res.status(201).json({
            success: true,
            message: "Conversation created",
            data: conversation
        });
    });

    GetMyConversations = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId || !role) throw new AppError("Unauthorized", 401);

        const { profileId, type } = await this.getProfileId(userId, role);

        let conversations;
        if (type === "THERAPIST") {
            conversations = await this.conversationRepository.GetConversationsByTherapist(profileId);
        } else {
            conversations = await this.conversationRepository.GetConversationsByClient(profileId);
        }

        return res.status(200).json({
            success: true,
            data: conversations
        });
    });

    GetConversationById = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const conversationId = req.params.id as string;
        if (!conversationId) throw new AppError("Conversation ID is required", 400);

        const conversation = await this.conversationRepository.GetConversationById(conversationId);
        if (!conversation) {
            throw new AppError("Conversation not found", 404);
        }

        // Validate access
        const userId = req.user?.userId;
        const role = req.user?.role;
        if (!userId || !role) throw new AppError("Unauthorized", 401);

        const { profileId, type } = await this.getProfileId(userId, role);

        if (type === "THERAPIST" && conversation.therapistId !== profileId) {
            throw new AppError("Unauthorized access to this conversation", 403);
        }
        if (type === "CLIENT" && conversation.clientId !== profileId) {
            throw new AppError("Unauthorized access to this conversation", 403);
        }

        return res.status(200).json({
            success: true,
            data: conversation
        });
    });
}
