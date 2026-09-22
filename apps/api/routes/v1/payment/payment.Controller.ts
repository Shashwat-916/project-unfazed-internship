import type { Request, Response } from "express";
import { AsyncHandler } from "../../../shared/api.handler";
import { VerifyPaymentValidation } from "@repo/types";
import type { PaymentRepository } from "./payment,Respository";
import type { PaymentService } from "./payment.Service";


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
});
}