import { prisma } from "@repo/db";

export class TherapistRespository {
     async FindTherapistByUserId(userId: string) {
        const therapist = await prisma.therapist.findUnique({
            where:{
                userId: userId
            }
        })
        return therapist;
        
    }

     async UpdateTherapistByUserId(userId: string, data: any) {
        const therapist = await prisma.therapist.update({
            where: {
                userId: userId
            },
            data,
        });
        return therapist;
    }
}
