import { Router } from "express";
import { authMiddleware } from "../../../middleware/authMiddlware";
import { PaymentController } from "./payment.Controller";
import { PaymentRepository } from "./payment.Respository";
import { PaymentService } from "./payment.Service";

export const paymentRouter = Router()

const paymentResitory = new PaymentRepository();
const paymentService = new PaymentService();
const paymentController = new PaymentController({ paymentResitory, paymentService });

paymentRouter.post('/verify', authMiddleware, paymentController.VerifyPayment);

export default paymentRouter