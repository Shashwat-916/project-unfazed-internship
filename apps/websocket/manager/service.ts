import { JWT_SECRET } from '@repo/common'
import { prisma } from '@repo/db';
import jwt from 'jsonwebtoken'

export class WebsocketService {
    static async CheckUser(token: any) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET as string) as any;

            if (typeof decoded == "string") {
                return null;
            }

            if (!decoded || !decoded.id) {
                throw new Error("Invalid Token");
            }

            return decoded.id;
        } catch (e: any) {
            console.error(`[CheckUser] JWT verification failed for token "${token ? token.substring(0, 15) + "..." : "empty"}":`, e.message);
            return null;
        }
    }

    static async GetUserByUserId(userId: any) {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })
            return user

        }
        catch (e) {
            console.log(e)
        }
        
    }
}

