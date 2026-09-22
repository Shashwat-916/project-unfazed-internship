import { z } from 'zod'
import { GMAIL_REGEX } from '../index.ts'




export const SendOtpZodValidation = z.object({
    email: z.string().regex(GMAIL_REGEX, "Only Gmail addresses are allowed"),
    password: z.string()
})

export const VerifyOtpZodValidation = z.object({
    email: z.string().regex(GMAIL_REGEX, "Only Gmail addresses are allowed"),
    otp: z.string().length(6)
})

export const RegisterTherapistValidation = z.object({
    email: z.string().regex(GMAIL_REGEX, "Only Gmail addresses are allowed"),
    name: z.string(),
    phoneNumber: z.union([z.string(), z.number()]).transform(n => String(n)).refine(s => s.length === 10, { message: "Phone Number Must be exactly 10 Digits" }),
    specialization: z.union([z.array(z.string()), z.string().transform(s => [s])]).optional(),
    bio: z.union([z.array(z.string()), z.string().transform(s => [s])]).optional(),
    profileImage: z.string().optional(),
    languages: z.union([z.array(z.string()), z.string().transform(s => [s])]).optional()
});

export const RegisterClientValidation = z.object({
    email: z.string().regex(GMAIL_REGEX, "Only Gmail addresses are allowed"),
    name: z.string(),
    phoneNumber: z.union([z.string(), z.number()]).transform(n => String(n)).refine(s => s.length === 10, { message: "Phone Number Must be exactly 10 Digits" })
})

export const LoginZodValidation = z.object({
    email: z
        .string()
        .regex(GMAIL_REGEX, "Only Gmail addresses are allowed"),
    
    password: z.string()
});


export type SendOtpInputType = z.infer<typeof SendOtpZodValidation>
export type VerifyOtpInputType = z.infer<typeof VerifyOtpZodValidation>
export type RegisterTherapistInputType = z.infer<typeof RegisterTherapistValidation>
export type RegisterClientInputType = z.infer<typeof RegisterClientValidation>
