import { z } from "zod";

export const ConversationCreateZodValidation = z.object({
    clientId: z.string().uuid().optional(),
    therapistId: z.string().uuid().optional(),
});
