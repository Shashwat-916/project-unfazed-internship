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
                phoneNumber: data.phoneNumber,
                slug: data.slug,
                specialization: data.specialization || [],
                bio: data.bio || [],
                profileImage: data.profileImage,
                languages: data.languages || [],
                userId: data.userId
            }
        });
        return therapist;
    }

    async CreateClientUser(data: CreateClientInputType) {
        const client = await prisma.client.create({
            data: {
                phoneNumber: data.phoneNumber,
                userId: data.userId
            }
        });
        return client;
    }

    async FindClientByUserId(userId: string) {
        return prisma.client.findUnique({
            where: { userId: userId }
        });
    }

    async FindTherapistByUserId(userId: string) {
        return prisma.therapist.findUnique({
            where: { userId: userId }
        });
    }

    async CreateUser(data: CreateUserType) {
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: data.password || "",
                name: data.name,
                UserRole: data.UserRole,
                verified: data.verified || false
            }
        });
        return user;
    }

    async RegisterClientTransaction(userData: CreateUserType, clientData: Omit<CreateClientInputType, "userId">) {
        return prisma.$transaction(async (tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
            const user = await tx.user.create({
                data: {
                    email: userData.email,
                    password: userData.password || "",
                    name: userData.name,
                    UserRole: userData.UserRole,
                    verified: userData.verified || false
                }
            });

            const client = await tx.client.create({
                data: {
                    phoneNumber: clientData.phoneNumber,
                    profileImage: userData.profileImage,
                    userId: user.id
                }
            });

            return { user, client };
        });
    }

    async RegisterTherapistTransaction(userData: CreateUserType, therapistData: Omit<CreateTherapistInputType, "userId">) {
        return prisma.$transaction(async (tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
            const user = await tx.user.create({
                data: {
                    email: userData.email,
                    password: userData.password || "",
                    name: userData.name,
                    UserRole: userData.UserRole,
                    verified: userData.verified || false
                }
            });

            const therapist = await tx.therapist.create({
                data: {
                    phoneNumber: therapistData.phoneNumber,
                    slug: therapistData.slug,
                    specialization: therapistData.specialization || [],
                    bio: therapistData.bio || [],
                    profileImage: therapistData.profileImage,
                    languages: therapistData.languages || [],
                    userId: user.id
                }
            });

            return { user, therapist };
        });
    }
}