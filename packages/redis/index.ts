
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




export class PubSubManager {
    private static instance: PubSubManager;
    private publisher: ReturnType<typeof createClient>;
    private subscriber: ReturnType<typeof createClient>;
    private isConnected: boolean = false;

    private constructor() {
        const url = process.env.REDIS_URL || "redis://localhost:6379";
        
        this.publisher = createClient({ url });
        this.subscriber = createClient({ url });

        this.publisher.on("error", (err) => console.error("Redis Publisher Error", err));
        this.subscriber.on("error", (err) => console.error("Redis Subscriber Error", err));
    }

    public static getInstance(): PubSubManager {
        if (!this.instance) {
            this.instance = new PubSubManager();
        }
        return this.instance;
    }

    public async connect() {
        if (!this.isConnected) {
            await Promise.all([
                this.publisher.connect(),
                this.subscriber.connect()
            ]);
            this.isConnected = true;
            console.log("Connected to Redis Pub/Sub");
        }
    }

    public async publish(channel: string, message: any) {
        if (!this.isConnected) await this.connect();
        await this.publisher.publish(channel, JSON.stringify(message));
    }

    public async subscribe(channel: string, callback: (message: any) => void) {
        if (!this.isConnected) await this.connect();
        await this.subscriber.subscribe(channel, (messageStr) => {
            try {
                const message = JSON.parse(messageStr);
                callback(message);
            } catch (err) {
                console.error("Failed to parse pub/sub message", err);
            }
        });
    }
}


const redisInstance = RedisManager.getInstance()
export const redis = redisInstance.getClient()
export const redisBlocking = redisInstance.getBlockingClient()
