import type { UserRole } from "@repo/types";

export type CreateTherapistInputType = {
    phoneNumber: string;
    specialization?: string[];
    bio?: string[];
    profileImage?: string;
    languages?: string[];
    userId: string;
    slug: string;
}

export type CreateClientInputType = {
    phoneNumber: string;
    userId: string;
}

export type CreateUserType = {
    email: string;
    password?: string;
    name: string;
    profileImage?: string | null;
    UserRole: UserRole;
    verified?: boolean;
}