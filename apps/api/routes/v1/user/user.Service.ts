
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../../../packages/common";
import { prisma } from "@repo/db";



export class UserService {

    async GetUserByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    async GetUserById(id: string) {
        return prisma.user.findUnique({ where: { id } });
    }

    GenerateToken(payload: { id: string }) {

        const token = jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });
        return token;

    }
}