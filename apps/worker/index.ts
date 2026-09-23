import { OTP_SEND_EMAIL } from "./otp-email/worker";
import { PAYMENT_SUCCESS_CLIENT_EMAIL } from "./payment-sucess-client/worker";
import { PAYMENT_SUCCESS_THERAPIST_EMAIL } from "./payment-sucess-therapist/worker";

async function startWorkers() {
    console.log("Starting workers...");
    OTP_SEND_EMAIL();
    PAYMENT_SUCCESS_CLIENT_EMAIL();
    PAYMENT_SUCCESS_THERAPIST_EMAIL();
}

startWorkers();
