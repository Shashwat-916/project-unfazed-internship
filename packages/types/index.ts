export *  from "./validations/auth.types"
export * from "./validations/avalability.types"
export * from "./validations/client.types"
export * from "./validations/service.types"
export * from "./validations/therapist.types"
export * from "./validations/appointment.types"
export * from "./validations/payment.types"
export * from "./validations/clientIntake.types"
export * from "./validations/sessionNotes.types"
export * from "./validations/conversation.types"
export * from "./validations/message.types"
export * from "./validations/notification.types"



export const GMAIL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@gmail\.com$/;

export type UserRole = "CLIENT" | "THERAPIST"
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED "
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED"
export type DaysOfWeek = | "MONDAY"| "TUESDAY"| "WEDNESDAY"| "THURSDAY"| "FRIDAY"| "SATURDAY"| "SUNDAY";

export interface User {

    email: string;
    name: String
    verified: Boolean
    UserRole: UserRole
    profileImage?:string
    
}
export const TIME_SLOTS = new Map<number, {
    startTime: string;
    endTime: string;
}>([
    [1, { startTime: "09:00", endTime: "09:50" }],
    [2, { startTime: "10:00", endTime: "10:50" }],
    [3, { startTime: "11:00", endTime: "11:50" }],
    [4, { startTime: "12:00", endTime: "12:50" }],
    [5, { startTime: "13:00", endTime: "13:50" }],
    [6, { startTime: "14:00", endTime: "14:50" }],
    [7, { startTime: "15:00", endTime: "15:50" }],
    [8, { startTime: "16:00", endTime: "16:50" }],
]);