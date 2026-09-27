import { WebSocket } from 'ws';

export type Status = "ACTIVE" | "INACTIVE";

export interface UserData {
    userId: string;
    role: string;
    status: Status;
    socket: WebSocket;
}

export class UserManager {
    private static instance: UserManager;
    private users = new Map<string, UserData>();

    public static getInstance(): UserManager {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    addUser(userId: string, data: any) {
        this.users.set(userId, data);
    }

    getUser(userId: string): UserData | undefined {
        return this.users.get(userId);
    }

    removeUser(userId: string) {
        this.users.delete(userId);
    }
}

export const userInstance = UserManager.getInstance();