
import { createClient, type RedisClientType } from 'redis'


export class RedisManager {

    private client: RedisClientType;
    private blockingClient: RedisClientType;
    private static instance: RedisManager

    private constructor() {
        this.client = createClient()
        this.client.on('error', (err) => { console.error("Redis Client Error:", err) })
        this.client.on('connect', () => { console.log("Redis connected Successfully") })
        this.client.connect().catch(console.error)

        this.blockingClient = createClient()
        this.blockingClient.on('error', (err) => { console.error("Redis Blocking Client Error:", err) })
        this.blockingClient.on('connect', () => { console.log("Redis Blocking Client connected Successfully") })
        this.blockingClient.connect().catch(console.error)
    }

    public static getInstance(): RedisManager {
        if (!this.instance) {
            this.instance = new RedisManager()
        }
        return this.instance
    }

    public getClient(): RedisClientType {
        return this.client
    }

    public getBlockingClient(): RedisClientType {
        return this.blockingClient
    }

}

const redisInstance = RedisManager.getInstance()
export const redis = redisInstance.getClient()
export const redisBlocking = redisInstance.getBlockingClient()