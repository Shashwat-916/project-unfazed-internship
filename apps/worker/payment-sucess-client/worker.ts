
import { redis } from "@repo/redis";
import { NodeMailerService } from "./nodemailer";
import { PAYMENT_CLIENT_QUEUE } from "@repo/common";

const mailService = new NodeMailerService();
const isolatedRedis = redis.duplicate();

export const PAYMENT_SUCCESS_CLIENT_EMAIL = async () => {
    console.log("PAYMENT_SUCCESS_CLIENT_EMAIL STARTED ✅")
    await isolatedRedis.connect();
    
    while (true) {
        try {
            const response = await isolatedRedis.brPop(PAYMENT_CLIENT_QUEUE, 0);
            if (!response) continue;
            const job = JSON.parse(response.element);
            console.log("PICKED A JOB", job.email);

            await mailService.SendPaymentSuccess(job.email, job.name, job.appointmentDate, job.amount, job.therapistName);
        } catch (error) {
            console.error("Error in PAYMENT_SUCCESS_CLIENT_EMAIL worker:", error);
        }
    }
}
