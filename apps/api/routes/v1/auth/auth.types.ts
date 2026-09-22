import type { UserRole } from "@repo/types";

export type CreateTherapistInputType = {
    email: string;
    name: string;
    phoneNumber: string;
    specialization?: string[];
    bio?: string[];
    profileImage?: string;
    languages?: string[];
    userId: string;
    slug: string;
}

export type CreateClientInputType = {
    email: string;
    name: string;
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