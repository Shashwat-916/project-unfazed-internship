import type { Request, Response, NextFunction } from "express";
import { AsyncHandler } from "../shared/api.handler";
import { AppError } from "../shared/api.error";
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { prisma } from "@repo/db";
import type { UserRole } from "@repo/types";


export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: UserRole;
    };
}

export const authMiddleware = AsyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Header Not Found", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        throw new AppError("Token Not Found", 401);
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET!)  as JwtPayload

    if (!decoded || !decoded.id) {
        throw new AppError("Unauthorized: Invalid token", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded} });
    if (!user) {
        throw new AppError("Unauthorized: User not found", 401);
    }

    req.user = {
        userId: user.id,
        role: user.UserRole as UserRole,
        
    };

    next();
});