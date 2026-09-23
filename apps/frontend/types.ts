
export type PaymentStatus = "PENDING"|"SUCCESS"| "FAILED"
export type AppointmentStatus ="PENDING"|"CONFIRMED"|"CANCELLED"|"COMPLETED"
export type Status = "ACTIVE" | "INACTIVE"

export interface AppointmentTherapistUser {
  name: string;
}

export interface AppointmentTherapist {
  id: string;
  phoneNumber: string;
  slug: string;
  specialization: string[];
  bio: string[];
  profileImage: string | null;
  languages: string[];
  status: Status;
  userId: string;

  user: AppointmentTherapistUser;
}

export interface AppointmentService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  serviceImage: string | null;
  createdAt: string;
  updatedAt: string;
  therapistId: string;
}

export interface Appointment {
  
  id: string;
  therapistId: string;
  clientId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  appointmentStatus: AppointmentStatus;
  bookingTime: string;

  therapist: AppointmentTherapist;
  service: AppointmentService;
}

export interface AppointmentsResponse {
  success: boolean;
  appointments: Appointment[];
}