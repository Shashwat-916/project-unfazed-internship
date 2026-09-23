import { RegisterClientValidation, RegisterTherapistValidation, SendOtpZodValidation, VerifyOtpZodValidation } from "../../../../../packages/types/validations/auth.types";
import { AsyncHandler } from "../../../shared/api.handler";
import type { Request, Response } from 'express'
import type { AuthRespository } from "./auth.Respository";
import type { AuthService } from "./auth.service";
import bcrypt from "bcryptjs";
import { rateLimiter } from "@repo/redis";



interface AuthControllerDependency {
    authRespository: AuthRespository;
    authService: AuthService;
}

export class AuthController {

    private authRespository: AuthRespository;
    private authService: AuthService


    constructor({ authRespository, authService }: AuthControllerDependency) {
        this.authService = authService,
        this.authRespository = authRespository;
    }

    SendOtp = AsyncHandler(async (req: Request, res: Response) => {

        const { data, success, error } = SendOtpZodValidation.safeParse(req.body)
        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid Schema",
                errors: error.issues
            })
        }

        const isAllowed = await rateLimiter.consume(`ratelimit:otp:${data.email}`, 3, 3, 60);
        if (!isAllowed) {
            return res.status(429).json({
                success: false,
                message: "Too many OTP requests. Please try again later."
            });
        }

        const existingUser = await this.authRespository.FindUserByEmail(data.email)
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const otp = this.authService.GenerateRandomOTP();
        console.log(otp)

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        await Promise.all([

            this.authService.SetOtpToRedis(data.email, otp),
            this.authService.SetTempPassword(data.email, hashedPassword),
            this.authService.PushEmailJob(data.email, otp, data.password)

        ]);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    })

    VerifyOtp = AsyncHandler(async (req: Request, res: Response) => {

        const { data, success, error } = VerifyOtpZodValidation.safeParse(req.body)
        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid Schema",
                errors: error.issues
            })
        }



        const [cachedOtp, hashedPass] = await Promise.all([
            this.authService.GetOtpFromRedis(data.email),
            this.authService.GetTempPassword(data.email)
        ]);

        if (!cachedOtp || cachedOtp !== data.otp) {
            return res.status(400).json({
                success: false, message: "Invalid or expired OTP"
            });
        }

        await Promise.all([
            this.authService.DeleteOtpFromRedis(data.email),
            this.authService.DeleteTempPassword(data.email),
            this.authService.SetVerifiedEmailToRedis(data.email, hashedPass || "")
        ]);

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });
    })

    RegisterClient = AsyncHandler(async (req: Request, res: Response) => {

        const { data, success, error } = RegisterClientValidation.safeParse(req.body);
        if (!success) {
            return res.status(400).json({
                success: false, message: "Invalid schema", errors: error.issues
            });
        }

        const [isVerified, existingUser] = await Promise.all([
            this.authService.GetVerifiedEmailFromRedis(data.email),
            this.authService.FindUserByEmail(data.email)
        ]);

        if (!isVerified) {
            return res.status(403).json({
                success: false, 
                message: "Email not verified via OTP"
            });
        }

        if (existingUser) {
            return res.status(400).json({
                success: false,
                 message: "User already exists"
            });
        }

        await this.authRespository.RegisterClientTransaction({
            email: data.email,
            password: isVerified,
            name: data.name,
            UserRole: "CLIENT",
            verified: true,
        }, {
            phoneNumber: data.phoneNumber,
        });


        return res.status(201).json({
            success: true,
            message: "Client registered successfully",
        });
    })

    RegisterTherapist = AsyncHandler(async (req: Request, res: Response) => {

        const { data, success, error } = RegisterTherapistValidation.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ success: false, message: "Invalid schema", errors: error.issues });
        }

        const [isVerified, existingUser] = await Promise.all([
            this.authService.GetVerifiedEmailFromRedis(data.email),
            this.authRespository.FindUserByEmail(data.email)
        ]);

        if (!isVerified) {
            return res.status(403).json({
                success: false,
                message: "Email not verified via OTP"
            });
        }

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }



        const slug = this.authService.GenerateSlug(data.name);

        await this.authRespository.RegisterTherapistTransaction({
            email: data.email,
            password: isVerified,
            name: data.name,
            UserRole: "THERAPIST",
            profileImage: data.profileImage,
            verified: true
        }, {
            phoneNumber: data.phoneNumber,
            specialization: data.specialization,
            bio: data.bio,
            profileImage: data.profileImage,
            languages: data.languages,
            slug
        });

        return res.status(201).json({
            success: true,
            message: "Therapist registered successfully",
        });
    })

}