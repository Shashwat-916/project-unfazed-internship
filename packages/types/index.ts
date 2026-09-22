import { SendOtpSchema }  from "./validations/auth.types"

export const GMAIL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@gmail\.com$/;

export type UserRole = "CLIENT" | "THERAPIST"
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED "
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED"
