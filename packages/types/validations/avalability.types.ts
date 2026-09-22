import { z } from "zod";

export const DayOfWeekSchema = z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY"
]);

export const CreateAvailabilityValidation = z.object({
    dayOfWeek: DayOfWeekSchema,
    timeSlotId: z.number().int().positive(),
});

export type CreateAvailabilityInput = z.infer<typeof CreateAvailabilityValidation>;
