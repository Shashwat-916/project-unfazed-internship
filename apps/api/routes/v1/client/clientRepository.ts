import { prisma } from "@repo/db";


export class ClientRespository {
     async FindClientByUserId(userId: string) {
        const client = await prisma.client.findUnique({
            where:{
                userId: userId
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })
        return client;
        
    }

     async UpdateClientByUserId(userId: string, data: any) {
        const client = await prisma.client.update({
            where: {
                userId: userId
            },
            data,
        });
        return client;
    }
}