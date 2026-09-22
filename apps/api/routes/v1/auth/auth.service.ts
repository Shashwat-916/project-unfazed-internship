import { prisma } from '@repo/db'
import { redis } from '@repo/redis/redis'
import crypto from 'crypto'
import { JWT_SECRET, SEND_OTP_QUEUE } from '../../../../../packages/common'
import jwt from 'jsonwebtoken'


export class AuthService {

    

    GenerateRandomOTP() {
        return crypto.randomInt(100000, 999999).toString()
    }

    async FindUserByEmail(email: string) {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        return user
    }

    GenerateSlug(name: string) {
        const baseSlug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        const randomString = crypto.randomBytes(2).toString("hex");
        return `${baseSlug}-${randomString}`;
    }

    async SetOtpToRedis(key: string, otp: string) {
        await redis.setEx(key, 300, otp)
    }

    async GetOtpFromRedis(key: string) {
        const otp = await redis.get(key)
        return otp
    }

    async DeleteOtpFromRedis(key: string) {
        await redis.del(key)
    }

    async SetTempPassword(email: string, hashedPass: string) {
        await redis.setEx(`tempPass:${email}`, 300, hashedPass);
    }

    async GetTempPassword(email: string) {
        return await redis.get(`tempPass:${email}`);
    }

    async DeleteTempPassword(email: string) {
        await redis.del(`tempPass:${email}`);
    }

    async SetVerifiedEmailToRedis(email: string, passwordHash: string) {
        await redis.setEx(`verified:${email}`, 900, passwordHash);
    }

    async GetVerifiedEmailFromRedis(email: string) {
        return await redis.get(`verified:${email}`);
    }

    async DeleteVerifiedEmailFromRedis(email: string) {
        await redis.del(`verified:${email}`);
    }

    GenerateToken(payload: { id: string }) {
        if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    }

    VerifyToken(token: string) {
        if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
        return jwt.verify(token, JWT_SECRET);
    }

    async PushEmailJob(email: string, otp: string, password?: string) {
        if (!SEND_OTP_QUEUE) throw new Error("SEND_OTP_QUEUE is not defined");
        const payload = JSON.stringify({ email, otp, password });
        await redis.lPush(SEND_OTP_QUEUE, payload);
    }
}