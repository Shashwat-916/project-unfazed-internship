import { redisBlocking } from '@repo/redis';
import { prisma } from '@repo/db';

export const QUEUE_MESSAGES = "enrich:db";

export async function startWorker() {
    console.log("Worker started. Listening to queue:", QUEUE_MESSAGES);
    while (true) {}
}