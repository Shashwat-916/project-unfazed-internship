import { prisma } from "@repo/db";
import type { CreateClientInputType, CreateTherapistInputType, CreateUserType } from "./auth.types";

export class AuthRespository {
    


    async FindUserByEmail(email: string) {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        return user
    }

    async FindUserById(userId: string) {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        return user
    }

    async CreateTherapistUser(data: CreateTherapistInputType) {
        const therapist = await prisma.therapist.create({
            data: {
                email: data.email,
                name: data.name,
                phoneNumber: data.phoneNumber,
                slug: data.slug,
                specialization: data.specialization || [],
                bio: data.bio || [],
                profileImage: data.profileImage,
                languages: data.languages || [],
                therapistId: data.userId
            }
        });
        return therapist;
    }

    async CreateClientUser(data: CreateClientInputType) {
        const client = await prisma.client.create({
            data: {
                email: data.email,
                name: data.name,
                phoneNumber: data.phoneNumber,
                clientId: data.userId
            }
        });
        return client;
    }

    async FindClientByUserId(userId: string) {
        return prisma.client.findUnique({
            where: { clientId: userId }
        });
    }

    async FindTherapistByUserId(userId: string) {
        return prisma.therapist.findUnique({
            where: { therapistId: userId }
        });
    }

    async CreateUser(data: CreateUserType) {
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: data.password || "",
                name: data.name,
                profileImage: data.profileImage,
                UserRole: data.UserRole,
                verified: data.verified || false
            }
        });
        return user;
    }
}