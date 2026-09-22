import { redis } from "@repo/redis";
import crypto from "crypto";
import { razorpayInstance } from "../../../shared/razorpay";
import { RAZOR_SECRET_KEY } from "@repo/common";

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

 }

 export const paymentService = new PaymentService()