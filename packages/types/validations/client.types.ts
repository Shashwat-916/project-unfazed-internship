import z from "zod";


export const ClientUpdateZodValidation = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number cannot be empty")
    .max(10, "please give correct phoneBumber")
    .optional(),
});

export type TClientUpdate = z.infer<typeof ClientUpdateZodValidation>;