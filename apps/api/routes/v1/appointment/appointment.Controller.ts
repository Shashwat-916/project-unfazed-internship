import type { AuthRequest } from "../../../middleware/authMiddlware";
import { AsyncHandler } from "../../../shared/api.handler";
import type { Request, Response } from 'express';
import type { AppointmentRespository } from "./appointment.Respository";
import type { AppointmentService } from "./appointment.Service";
import { BookAppointmentValidation } from "@repo/types";
import type { PaymentService } from "../payment/payment.Service";



export interface IAppointmentController {

    appointmentRespository: AppointmentRespository;
    appointmentService: AppointmentService
}


export class AppointmentControler {

    private appointmentRespository: AppointmentRespository;
    private appointmentService: AppointmentService

    constructor({ appointmentRespository, appointmentService }: IAppointmentController) {
 
        this.appointmentRespository = appointmentRespository
        this.appointmentService = appointmentService
 
    }

    BookAppointment = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new Error("User not found")
        }

        const client = await this.appointmentRespository.GetClientByUserId(userId)
        if (!client) {
            return res.status(400).json({
                success: false,
                "message": "Client Not Found "
            })
        }


        const { data, success, error } = BookAppointmentValidation.safeParse(req.body);
        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid Schema"
            })
        }

         const {  serviceId , therapistId , date , day , timeSlotId } = data

        const [therapist, service, timeslot] = await Promise.all([
            this.appointmentRespository.GetTherapistById(therapistId),
            this.appointmentRespository.GetServiceById(serviceId),
            this.appointmentRespository.GetTimeSlotById(timeSlotId)
        ]);


        if (!therapist) {
            return res.status(404).json({ success: false, message: "Therapist not found" });
        }
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        if (!timeslot) {
            return res.status(404).json({ success: false, message: "Time slot not found" });
        }

        if (service.therapistId !== therapistId) {
            return res.status(400).json({ success: false, message: "Service does not belong to the selected therapist" });
        }

        
        const parsedDate = new Date(date);
        const isBooked = await this.appointmentRespository.checkIfBooked(therapist.id, parsedDate, timeslot.startTime, timeslot.endTime);
        if (isBooked) {
            return res.status(400).json({ success: false, message: "This time slot is already booked" });
        }
        const appointment = await this.appointmentService.BookAppointMentEnrich(
            client.id,
            service.id,
            therapist.id,
            service.price,
            new Date(date),
            day,
            timeslot.id,
            timeslot.startTime,
            timeslot.endTime
        );

        return res.status(200).json({
            success: true,
            appointment
        });

    })

    GetClientAppointments = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const client = await this.appointmentRespository.GetClientByUserId(userId);
        if (!client) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }

        const appointments = await this.appointmentRespository.getAppointmentsByClient(client.id);
        return res.status(200).json({ success: true, appointments });
    })

    GetTherapistAppointments = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const therapist = await this.appointmentRespository.GetTherapistByUserId(userId);
        if (!therapist) {
            return res.status(404).json({ success: false, message: "Therapist not found" });
        }

        const appointments = await this.appointmentRespository.getAppointmentsByTherapist(therapist.id);
        return res.status(200).json({ success: true, appointments });
    })
}