import { z } from "zod";

export const NotificationCreateZodValidation = z.object({
    userId: z.string().uuid(),
    content: z.string().min(1, "Notification content cannot be empty"),
});
