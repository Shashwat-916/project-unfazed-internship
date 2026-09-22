import z from "zod";
import { GMAIL_REGEX } from "..";

export const ClientUpdateZodValidation = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  phoneNumber: z
    .string()
    .min(10, "Phone number cannot be empty")
    .max(10, "please give correct phoneBumber")
    .optional(),
    email: z.string().regex(GMAIL_REGEX, "Only Gmail addresses are allowed").optional(),
});

export type TClientUpdate = z.infer<typeof ClientUpdateZodValidation>;