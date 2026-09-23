import type { User, Role } from "../types";
import { prisma } from "@repo/db";
import { WebSocket } from "ws";

export class UserManager {
    private static instance: UserManager;
    private users: Map<string, User>;
    
    private constructor() {
        this.users = new Map<string, User>();
    }

    static getInstance() {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    async addUser(id: string, role: Role, ws: WebSocket) {
        this.users.set(id, { id, role, ws });
        
        if (role === "THERAPIST") {
            try {
                await prisma.therapist.update({
                    where: { userId: id },
                    data: { status: "ACTIVE" }
                });
            } catch (error) {
                console.error(`Failed to update therapist status for ${id}:`, error);
            }
        }
    }

    async removeUser(id: string) {
        const user = this.users.get(id);
        if (user) {
            this.users.delete(id);
            if (user.role === "THERAPIST") {
                try {
                    await prisma.therapist.update({
                        where: { userId: id },
                        data: { status: "INACTIVE" }
                    });
                } catch (error) {
                    console.error(`Failed to update therapist status for ${id}:`, error);
                }
            }
        }
    }

    getUser(id: string): User | undefined {
        return this.users.get(id);
    }
}