import type { Request, Response } from "express";
import type { AuthRequest } from "../../../middleware/authMiddlware";
import { AsyncHandler } from "../../../shared/api.handler";
import type { AvailabilityService } from "./avalability.Service";
import type { AvailabilityRespository } from "./avalability.Respository";
import { CreateAvailabilityValidation } from "@repo/types";

export interface IAvailabilityController {
    avalabilityService: AvailabilityService
    avalabilityRepository: AvailabilityRespository
}

export class AvailabilityController {

    private avalabilityService: AvailabilityService
    private avalabilityRepository: AvailabilityRespository

    constructor({ avalabilityService, avalabilityRepository }: IAvailabilityController) {
        this.avalabilityRepository = avalabilityRepository;
        this.avalabilityService = avalabilityService;
    }

    CreateAvalability = AsyncHandler(
        async (req: AuthRequest, res: Response) => {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, message: "User not found" });
            }

            const { data, success, error } = CreateAvailabilityValidation.safeParse(req.body);
            if (!success) {
                return res.status(400).json({ success: false, message: "Invalid Schema", error: error.issues });
            }

            const therapist = await this.avalabilityRepository.GetTherapistById(userId);
            if (!therapist) {
                return res.status(404).json({ success: false, message: "Therapist not found" });
            }

            const isValidTimeSlot = await this.avalabilityService.verifyTimeSlot(data.timeSlotId);
            if (!isValidTimeSlot) {
                return res.status(400).json({ success: false, message: "Invalid time slot ID" });
            }

            try {
                const availability = await this.avalabilityRepository.CreateAvailability(data, therapist.id);
                return res.status(201).json({
                    success: true,
                    message: "Availability slot created successfully",
                    data: availability
                });
            } catch (err: any) {
                // Handle unique constraint failure
                if (err.code === 'P2002') {
                    return res.status(400).json({ success: false, message: "This time slot is already assigned to this day for this therapist." });
                }
                throw err;
            }
        }
    );

    GetAvalability = AsyncHandler(
        async (req: AuthRequest, res: Response) => {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, message: "User not found" });
            }

            const therapist = await this.avalabilityRepository.GetTherapistById(userId);
            if (!therapist) {
                return res.status(404).json({ success: false, message: "Therapist not found" });
            }

            const dayOfWeek = req.query.dayOfWeek as string | undefined;
            const availability = await this.avalabilityRepository.GetAvailabilityByTherapist(therapist.id, dayOfWeek);

            return res.status(200).json({
                success: true,
                data: availability
            });
        }
    );

    GetTimeSlots = AsyncHandler(
        async (req: Request, res: Response) => {
            const timeSlots = await this.avalabilityRepository.GetTimeSlots();
            return res.status(200).json({
                success: true,
                data: timeSlots
            });
        }
    );

    DeleteAvalability = AsyncHandler(
        async (req: AuthRequest, res: Response) => {
            const availabilityId = req.params.availabilityId as string;

            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, message: "User not found" });
            }

            const therapist = await this.avalabilityRepository.GetTherapistById(userId);
            if (!therapist) {
                return res.status(404).json({ success: false, message: "Therapist not found" });
            }

            const existingAvailability = await this.avalabilityRepository.GetAvailabilityById(availabilityId);
            if (!existingAvailability) {
                return res.status(404).json({ success: false, message: "Availability not found" });
            }
            if (existingAvailability.therapistId !== therapist.id) {
                return res.status(403).json({ success: false, message: "Unauthorized to delete this availability" });
            }
            
            await this.avalabilityRepository.DeleteAvailability(availabilityId);

            return res.status(200).json({
                success: true,
                message: "Availability slot deleted successfully"
            });
        }
    );
}