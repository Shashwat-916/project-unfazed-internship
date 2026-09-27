import type { AuthRequest } from "../../../middleware/authMiddlware";
import { AsyncHandler } from "../../../shared/api.handler";
import type { Request, Response } from 'express';
import { AppError } from "../../../shared/api.error";
import { SessionNoteCreateZodValidation, SessionNoteUpdateZodValidation } from "@repo/types";
import { prisma } from "@repo/db";
import { SessionNotesRepository } from "./sessionNotesRepository";

interface ISessionNotesController {
    sessionNotesRepository: SessionNotesRepository
}

export class SessionNotesController {
    private sessionNotesRepository: SessionNotesRepository

    constructor({ sessionNotesRepository }: ISessionNotesController) {
        this.sessionNotesRepository = sessionNotesRepository;
    }

    private async getTherapistId(userId: string) {
        const therapist = await prisma.therapist.findUnique({
            where: { userId }
        });
        if (!therapist) {
            throw new AppError("Therapist profile not found", 404);
        }
        return therapist.id;
    }

    private async getClientId(userId: string) {
        const client = await prisma.client.findUnique({
            where: { userId }
        });
        if (!client) {
            throw new AppError("Client profile not found", 404);
        }
        return client.id;
    }

    CreateNote = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);

        const therapistId = await this.getTherapistId(userId);

        const { data, success, error } = SessionNoteCreateZodValidation.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid Schema",
                errors: error.issues
            });
        }

        const newNote = await this.sessionNotesRepository.CreateNote(therapistId, data);

        return res.status(201).json({
            success: true,
            message: "Session note created successfully",
            data: newNote
        });
    });

    GetMyNotes = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);

        const therapistId = await this.getTherapistId(userId);
        const notes = await this.sessionNotesRepository.GetNotesByTherapist(therapistId);

        return res.status(200).json({
            success: true,
            data: notes
        });
    });

    GetNoteById = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const noteId = req.params.id as string;
        if (!noteId) throw new AppError("Note ID is required", 400);

        const therapistId = await this.getTherapistId(userId);
        const note = await this.sessionNotesRepository.GetNoteById(noteId, therapistId);

        if (!note) {
            throw new AppError("Session note not found", 404);
        }

        return res.status(200).json({
            success: true,
            data: note
        });
    });

    GetNotesByAppointment = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const appointmentId = req.params.appointmentId as string;
        if (!appointmentId) throw new AppError("Appointment ID is required", 400);

        const therapistId = await this.getTherapistId(userId);
        const notes = await this.sessionNotesRepository.GetNotesByAppointment(appointmentId, therapistId);

        return res.status(200).json({
            success: true,
            data: notes
        });
    });

    GetNotesByClient = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const clientId = req.params.clientId as string;
        if (!clientId) throw new AppError("Client ID is required", 400);

        const therapistId = await this.getTherapistId(userId);
        const notes = await this.sessionNotesRepository.GetNotesByClient(clientId, therapistId);

        return res.status(200).json({
            success: true,
            data: notes
        });
    });

    GetSharedNotesForClient = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const clientId = await this.getClientId(userId);
        const appointmentId = req.query.appointmentId as string | undefined;

        // ENFORCEMENT: Delegate to repo which strictly returns SHARED notes
        const notes = await this.sessionNotesRepository.GetSharedNotesByClient(clientId, appointmentId);

        return res.status(200).json({
            success: true,
            data: notes
        });
    });

    UpdateNote = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const noteId = req.params.id as string;
        if (!noteId) throw new AppError("Note ID is required", 400);

        const therapistId = await this.getTherapistId(userId);

        const { data, success, error } = SessionNoteUpdateZodValidation.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid Schema",
                errors: error.issues
            });
        }

        const updatedNote = await this.sessionNotesRepository.UpdateNote(noteId, therapistId, data);

        if (!updatedNote) {
            throw new AppError("Session note not found or you do not have permission to update it", 404);
        }

        return res.status(200).json({
            success: true,
            message: "Session note updated successfully",
            data: updatedNote
        });
    });

    DeleteNote = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const noteId = req.params.id as string;
        if (!noteId) throw new AppError("Note ID is required", 400);

        const therapistId = await this.getTherapistId(userId);
        const deletedNote = await this.sessionNotesRepository.DeleteNote(noteId, therapistId);

        if (!deletedNote) {
            throw new AppError("Session note not found or you do not have permission to delete it", 404);
        }

        return res.status(200).json({
            success: true,
            message: "Session note deleted successfully"
        });
    });
}
