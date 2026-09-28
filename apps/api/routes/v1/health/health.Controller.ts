import type { Request, Response } from "express";
import { prisma } from '@repo/db'
import { redis } from "@repo/redis";

import { AsyncHandler } from "../../../shared/api.handler";



export class HealthController {

    GetHealth = AsyncHandler(async (req: Request, res: Response) => {

        const startTime = Date.now();

        const checks = {
            database: "DOWN",
            redis: "DOWN",
        };

        try {
            await prisma.$queryRaw`SELECT 1`;
            checks.database = "UP";
        } catch (e) {
            console.log("HEALTH CHECK - DATABASE ERROR ", e);
        }

        try {
            await redis.ping();
            checks.redis = "UP";
        } catch (e) {
            console.log("HEALTH CHECK - REDIS ERROR ", e);
        }
        


        const isHealthy = Object.values(checks).every((status) => status === "UP");

        return res.status(isHealthy ? 200 : 503).json({
            status: isHealthy ? "UP" : "DOWN",
            checks,
            uptime: process.uptime(),
            timestamp: Date.now(),
            responseTime: Date.now() - startTime,
        });
    })
}