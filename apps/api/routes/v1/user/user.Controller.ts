import { AsyncHandler } from "../../../shared/api.handler";
import bcrypt from "bcryptjs";
import type { Request, Response } from 'express'
import { LoginZodValidation } from "../../../../../packages/types/validations/auth.types";
import { AppError } from "../../../shared/api.error";
import { UserService } from "./user.Service";
import type { AuthRequest } from "../../../middleware/authMiddlware";

export class UserController {

    private userService: UserService;

    constructor({ userService }: { userService: UserService }) {
        this.userService = userService
    }

    Login = AsyncHandler(async (req: Request, res: Response) => {

        const { data, success, error } = LoginZodValidation.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid Schema",
                errors: error.issues
            });
        }

        const user = await this.userService.GetUserByEmail(data.email);

        if (!user || !user.password) {
            throw new AppError("Invalid email or password", 401);
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new AppError("Invalid email or password", 401);
        }

        const token = this.userService.GenerateToken({ id: user.id });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.UserRole
            }
        });
    });

    GetCurrentUser = AsyncHandler(async (req: AuthRequest, res: Response) => {

        if (!req.user?.userId) {
            throw new AppError("Unauthorized", 401);
        }

        const user = await this.userService.GetUserById(req.user.userId);

        if (!user) {
            throw new AppError("User not found", 404);
        }


        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.UserRole,
                verified: user.verified
            }
        });
    });
    
}