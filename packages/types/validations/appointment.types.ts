import { z } from "zod";
import { DayOfWeekSchema } from "./avalability.types";


export const BookAppointmentValidation = z.object({
    therapistId: z.string().uuid("Invalid therapist ID"),
    serviceId: z.string().uuid("Invalid service ID"),
    date: z.string().date("Invalid date format, expected YYYY-MM-DD"),
    day: DayOfWeekSchema,
    timeSlotId: z.number().int().positive("Invalid time slot ID"),
});

export type BookAppointmentInput = z.infer<
    typeof BookAppointmentValidation
>;