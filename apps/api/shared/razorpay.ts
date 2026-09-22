import { RAZOR_API_KEY, RAZOR_SECRET_KEY } from "@repo/common";
import Razorpay from "razorpay";

export const razorpayInstance = new Razorpay({
    key_id: RAZOR_API_KEY as string,
    key_secret: RAZOR_SECRET_KEY as string,
});