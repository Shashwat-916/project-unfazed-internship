import { RAZOR_API_KEY, RAZOR_SECRET_KEY } from "@repo/common";
import Razorpay from "razorpay";

export const razorpayInstance = new Razorpay({
    key_id: (RAZOR_API_KEY || process.env.RAZOR_API_KEY || "dummy_api_key") as string,
    key_secret: (RAZOR_SECRET_KEY || process.env.RAZOR_SECRET_KEY || "dummy_secret_key") as string,
});