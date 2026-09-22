import { RegisterClientValidation, RegisterTherapistValidation, SendOtpZodValidation, VerifyOtpZodValidation } from "../../../../../packages/types/validations/auth.types";
import { AsyncHandler } from "../../../shared/api.handler";
import type { Request, Response } from 'express'
import type { AuthRespository } from "./auth.Respository";
import type { AuthService } from "./auth.service";
import bcrypt from "bcryptjs";



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



        const cachedOtp = await this.authService.GetOtpFromRedis(data.email);
        if (!cachedOtp || cachedOtp !== data.otp) {
            return res.status(400).json({
                success: false, message: "Invalid or expired OTP"
            });
        }

        const hashedPass = await this.authService.GetTempPassword(data.email);

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
                success: false, message: "Email not verified via OTP"
            });
        }

        if (existingUser) {
            return res.status(400).json({
                success: false, message: "User already exists"
            });
        }

        // keep these two create user and create client in prisma transactions
        const user = await this.authRespository.CreateUser({
            email: data.email,
            password: isVerified,
            name: data.name,
            UserRole: "CLIENT",
            verified: true,

        });

        await this.authRespository.CreateClientUser({
            email: data.email,
            name: data.name,
            phoneNumber: data.phoneNumber,
            userId: user.id
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



        const user = await this.authRespository.CreateUser({
            email: data.email,
            password: isVerified,
            name: data.name,
            UserRole: "THERAPIST",
            profileImage: data.profileImage,
            verified: true
        });

        const slug = this.authService.GenerateSlug(user.name);


        await this.authRespository.CreateTherapistUser({
            email: data.email,
            name: data.name,
            phoneNumber: data.phoneNumber,
            specialization: data.specialization,
            bio: data.bio,
            profileImage: data.profileImage,
            languages: data.languages,
            userId: user.id,
            slug
        });

        return res.status(201).json({
            success: true,
            message: "Therapist registered successfully",
        });
    })

}