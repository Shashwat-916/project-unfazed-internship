
import { redis } from "@repo/redis";
import { NodeMailerService } from "./nodemailer";
import { OTP_EMAIL_QUEUE } from "@repo/common";

const mailService = new NodeMailerService();
const isolatedRedis = redis.duplicate();


export const OTP_SEND_EMAIL = async () => {
    console.log("OTP_SEND_EMAIL STARTED ✅")
    await isolatedRedis.connect();
    
    while (true) {
        try {
            const response = await isolatedRedis.brPop(OTP_EMAIL_QUEUE, 0);
            if (!response) continue;
            const emailJob = JSON.parse(response.element);
            console.log("PICKED A JOB", emailJob.email);

            await mailService.SendOTP(emailJob.email, emailJob.otp);
        } catch (error) {
            console.error("Error in OTP_SEND_EMAIL worker:", error);
        }
    }
}