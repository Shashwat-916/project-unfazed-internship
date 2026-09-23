import { redis } from "@repo/redis";
import crypto from "crypto";
import { razorpayInstance } from "../../../shared/razorpay";
import { RAZOR_SECRET_KEY, PAYMENT_CLIENT_QUEUE, PAYMENT_THERAPIST_QUEUE } from "@repo/common";

 export class PaymentService {
    
    async AquireLock(lockKey: string, lockValue: string, ttl: number) {
       const result = await redis.set(
            lockKey,
            lockValue,
            {
                NX: true,
                PX: ttl,
            }
        );

        return result === "OK";

    }

    async ReleaseLock(lockKey: string, lockValue: string) {
        const script = `
            if redis.call("GET", KEYS[1]) == ARGV[1] then
                return redis.call("DEL", KEYS[1])
            else
                return 0
            end
        `;

        const result = await redis.eval(script, {
            keys: [lockKey],
            arguments: [lockValue],
        });

        return result === 1;
    }

    async createOrder(amount: number, receiptId: string) {
        const options = {
            amount: amount, 
            currency: "INR",
            receipt: receiptId,
        };
        const order = await razorpayInstance.orders.create(options);
        return order;
    }

    verifySignature(orderId: string, paymentId: string, signature: string) {
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac("sha256", RAZOR_SECRET_KEY as string)
            .update(body.toString())
            .digest("hex");
        
        return expectedSignature === signature;
    }

    async PushPaymentSuccessClientJob(email: string, name: string, appointmentDate: Date, amount: number, therapistName: string) {
        if (!PAYMENT_CLIENT_QUEUE) throw new Error("PAYMENT_CLIENT_QUEUE is not defined");
        const payload = JSON.stringify({ email, name, appointmentDate, amount, therapistName });
        await redis.lPush(PAYMENT_CLIENT_QUEUE, payload);
    }

    async PushPaymentSuccessTherapistJob(email: string, name: string, appointmentDate: Date, amount: number, clientName: string) {
        if (!PAYMENT_THERAPIST_QUEUE) throw new Error("PAYMENT_THERAPIST_QUEUE is not defined");
        const payload = JSON.stringify({ email, name, appointmentDate, amount, clientName });
        await redis.lPush(PAYMENT_THERAPIST_QUEUE, payload);
    }

 }

 export const paymentService = new PaymentService()