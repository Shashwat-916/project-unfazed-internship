import { z } from "zod";

export const VerifyPaymentValidation = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string()
});

export type VerifyPaymentInput = z.infer<typeof VerifyPaymentValidation>;