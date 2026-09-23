import { z } from "zod";

export const SessionNoteCreateZodValidation = z.object({
    appointmentId: z.string().uuid(),
    clientId: z.string().uuid(),
    type: z.enum(["PRIVATE", "SHARED"]).optional(),
    format: z.enum(["FREEFORM", "SOAP", "DAP"]).optional(),
    
    // FREEFORM
    content: z.string().optional(),
    
    // SOAP
    subjective: z.string().optional(),
    objective: z.string().optional(),
    assessment: z.string().optional(),
    plan: z.string().optional(),
    
    // DAP
    data: z.string().optional(),
    intervention: z.string().optional(),
});

export const SessionNoteUpdateZodValidation = z.object({
    type: z.enum(["PRIVATE", "SHARED"]).optional(),
    format: z.enum(["FREEFORM", "SOAP", "DAP"]).optional(),
    
    // FREEFORM
    content: z.string().optional(),
    
    // SOAP
    subjective: z.string().optional(),
    objective: z.string().optional(),
    assessment: z.string().optional(),
    plan: z.string().optional(),
    
    // DAP
    data: z.string().optional(),
    intervention: z.string().optional(),
});
