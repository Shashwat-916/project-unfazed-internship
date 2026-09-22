import { prisma } from '@repo/db';

async function main() {
    const slots = [
        { id: 1, startTime: new Date(1970, 0, 1, 9, 0, 0), endTime: new Date(1970, 0, 1, 9, 50, 0) },
        { id: 2, startTime: new Date(1970, 0, 1, 10, 0, 0), endTime: new Date(1970, 0, 1, 10, 50, 0) },
        { id: 3, startTime: new Date(1970, 0, 1, 11, 0, 0), endTime: new Date(1970, 0, 1, 11, 50, 0) },
        { id: 4, startTime: new Date(1970, 0, 1, 12, 0, 0), endTime: new Date(1970, 0, 1, 12, 50, 0) },
        { id: 5, startTime: new Date(1970, 0, 1, 13, 0, 0), endTime: new Date(1970, 0, 1, 13, 50, 0) },
        { id: 6, startTime: new Date(1970, 0, 1, 14, 0, 0), endTime: new Date(1970, 0, 1, 14, 50, 0) },
        { id: 7, startTime: new Date(1970, 0, 1, 15, 0, 0), endTime: new Date(1970, 0, 1, 15, 50, 0) },
        { id: 8, startTime: new Date(1970, 0, 1, 16, 0, 0), endTime: new Date(1970, 0, 1, 16, 50, 0) },
    ];

    console.log("Seeding TimeSlots...");
    for (const slot of slots) {
        await prisma.timeSlot.upsert({
            where: { id: slot.id },
            update: {},
            create: slot,
        });
    }
    console.log("TimeSlots seeded successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
