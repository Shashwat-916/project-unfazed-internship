import z from "zod";

export const TherapistUpdateZodValidation = z.object({

    phoneNumber: z.string().min(1, "Phone number cannot be empty").max(10, "please give correcctr phoneBumber").optional(),
   
    specialization: z.array(z.string()).optional(),
    bio: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type TTherapistUpdate = z.infer<typeof TherapistUpdateZodValidation>;