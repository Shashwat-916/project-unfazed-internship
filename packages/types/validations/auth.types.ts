import { z } from 'zod'
import { GMAIL_REGEX } from '../index.ts'




export const SendOtpSchema = z.object({
    email: z
        .string()
        .email()
        .regex(GMAIL_REGEX, "Only Gmail addresses are allowed"),
    password: z.string()
})

