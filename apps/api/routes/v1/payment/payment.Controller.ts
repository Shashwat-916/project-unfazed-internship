import type { Request, Response } from "express";
import { AsyncHandler } from "../../../shared/api.handler";
import { VerifyPaymentValidation } from "@repo/types";
import type { PaymentRepository } from "./payment.Respository";
import type { PaymentService } from "./payment.Service";
import { rateLimiter } from "@repo/redis";


export interface IPaymentController {
    paymentResitory: PaymentRepository
    paymentService: PaymentService

}
export class PaymentController {

    private paymentResitory: PaymentRepository
    private paymentService: PaymentService

    constructor({ paymentResitory, paymentService }: IPaymentController) {
        this.paymentResitory = paymentResitory
        this.paymentService = paymentService
    }

    VerifyPayment = AsyncHandler(async (req: Request, res: Response) => {
        const { data, success, error } = VerifyPaymentValidation.safeParse(req.body);
        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid input",
                errors: error.issues
            });
        }
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

        const isAllowed = await rateLimiter.consume(`ratelimit:paymentVerify:${razorpay_order_id}`, 5, 5, 60);
        if (!isAllowed) {
            return res.status(429).json({
                success: false,
                message: "Too many verification attempts for this order. Please try again later."
            });
        }

        const payment = await this.paymentResitory.GetPaymentByOrderId(razorpay_order_id);

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment order not found" });
        }

        const isValidSignature = this.paymentService.verifySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValidSignature) {
            await this.paymentResitory.UpdatePaymentStatus(razorpay_order_id, razorpay_payment_id, razorpay_signature, "FAILED");
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        await this.paymentResitory.UpdatePaymentStatus(razorpay_order_id, razorpay_payment_id, razorpay_signature, "SUCCESS");
        
        if (payment.appointmentId) {
            await this.paymentResitory.UpdateAppointmentStatus(payment.appointmentId, "CONFIRMED");
            
            // Enqueue success emails
            if (payment.appointment.client.user.email && payment.appointment.therapist.user.email) {
                await Promise.all([
                    this.paymentService.PushPaymentSuccessClientJob(
                        payment.appointment.client.user.email,
                        payment.appointment.client.user.name,
                        payment.appointment.startTime,
                        payment.amount,
                        payment.appointment.therapist.user.name
                    ),
                    this.paymentService.PushPaymentSuccessTherapistJob(
                        payment.appointment.therapist.user.email,
                        payment.appointment.therapist.user.name,
                        payment.appointment.startTime,
                        payment.amount,
                        payment.appointment.client.user.name
                    )
                ]);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully"
        });
    });
}