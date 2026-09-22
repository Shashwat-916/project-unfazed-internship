import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middleware/authMiddlware";
import { AppointmentControler } from "./appointment.Controller";
import { AppointmentRespository } from "./appointment.Respository";
import { AppointmentService } from "./appointment.Service";
import { PaymentService } from "../payment/payment.Service";

const appointmentRouter = Router();

const paymentService = new PaymentService();
const appointmentRespository = new AppointmentRespository();
const appointmentService = new AppointmentService(paymentService);
const appointmentController = new AppointmentControler({ appointmentRespository, appointmentService });

appointmentRouter.post("/book", authMiddleware, requireRole(["CLIENT"]), appointmentController.BookAppointment);
appointmentRouter.get("/client", authMiddleware, requireRole(["CLIENT"]), appointmentController.GetClientAppointments);
appointmentRouter.get("/therapist", authMiddleware, requireRole(["THERAPIST"]), appointmentController.GetTherapistAppointments);


export default appointmentRouter;