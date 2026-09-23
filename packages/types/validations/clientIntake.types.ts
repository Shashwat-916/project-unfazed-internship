import { z } from "zod";

export const ClientIntakeUpdateZodValidation = z.object({
    dateOfBirth: z.string().datetime().optional(),
    gender: z.string().optional(),
    occupation: z.string().optional(),
    presentingConcern: z.string().optional(),
    currentSymptoms: z.string().optional(),
    medicalHistory: z.string().optional(),
    mentalHealthHistory: z.string().optional(),
    medicationHistory: z.string().optional(),
    familyHistory: z.string().optional(),
    previousTherapy: z.string().optional(),
    goals: z.string().optional(),
    additionalInfo: z.any().optional(),
});
