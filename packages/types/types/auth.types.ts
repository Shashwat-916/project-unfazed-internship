import { z } from 'zod'
import { GMAIL_REGEX } from '../index.ts'


console.log(GMAIL_REGEX)

export const SendOtpSchema = z.object({
    email: z
        .string()
        .email()
        .regex(GMAIL_REGEX, "Only Gmail addresses are allowed"),
    password: z.string()
})