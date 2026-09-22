import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })


export const API_PORT=process.env.API_PORT;
export const WEBSOCKET_PORT=process.env.WEBSOCKET_PORT;
export const WEBRTC_PORT=process.env.WEBRTC_PORT;
export const WORKER_PORT=process.env.WORKER_PORT

console.log(API_PORT)

export const DATABASE_URL = process.env.DATABASE_URL
export const REDIS_URL = process.env.REDIS_URL;
export const JWT_SECRET = process.env.JWT_SECRET;



export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT;
export const MINIO_PORT = process.env.MINIO_PORT;
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY;
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY;
export const MINIO_BUCKET = process.env.MINIO_BUCKET;
export const MINIO_USE_SSL = process.env.MINIO_USE_SSL;

export const RAZOR_API_KEY = process.env.RAZOR_API_KEY;
export const RAZOR_SECRET_KEY = process.env.RAZOR_SECRET_KEY;
export const NEXT_PUBLIC_RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;


export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const SMTP_PORT = process.env.SMTP_PORT;


export const commonEnv = [
    API_PORT,
    WEBSOCKET_PORT,
    WEBRTC_PORT,
    WORKER_PORT,
    DATABASE_URL,
    REDIS_URL,
    JWT_SECRET,
    MINIO_ENDPOINT,
    MINIO_PORT,
    MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY,
    MINIO_BUCKET,
    MINIO_USE_SSL,
    RAZOR_API_KEY,
    RAZOR_SECRET_KEY,
    NEXT_PUBLIC_RAZORPAY_KEY_ID,
    SMTP_HOST,
    SMTP_USER,
    SMTP_PASS,
    SMTP_PORT
]

export const SEND_OTP_QUEUE = "send:otp"


//check whether the env is set or not all the env variables are there or not or is anyone is missing or undefined
function CheckEnv(env: string[]) {
    // check if all the env variables are set if not then throw an error
}