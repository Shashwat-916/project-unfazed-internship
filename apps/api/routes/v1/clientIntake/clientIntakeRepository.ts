import { prisma } from "@repo/db";

export class ClientIntakeRepository {
    async GetByUserId(userId: string) {
        return await prisma.clientIntake.findFirst({
            where: {
                client: {
                    userId: userId
                }
            }
        });
    }

    async CreateIntake(clientId: string, data: any) {
        return await prisma.clientIntake.create({
            data: {
                clientId,
                ...data
            }
        });
    }

    async UpdateIntake(userId: string, data: any) {
        // We update the intake where the associated client has this userId
        return await prisma.clientIntake.updateMany({
            where: {
                client: {
                    userId: userId
                }
            },
            data
        });
    }
}
