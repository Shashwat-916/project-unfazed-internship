
import { createClient, type RedisClientType } from 'redis'


export class RedisManager {

    private client: RedisClientType;
    private blockingClient: RedisClientType;
    private static instance: RedisManager

    private constructor() {
        const url = process.env.REDIS_URL || "redis://localhost:6379";

        this.client = createClient({ url })
        this.client.on('error', (err) => { console.error("Redis Client Error:", err) })
        this.client.on('connect', () => { console.log("Redis connected Successfully") })
        this.client.connect().catch(console.error)

        this.blockingClient = createClient({ url })
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

export class RateLimiter {
    private client: RedisClientType;
    
    constructor() {
        this.client = RedisManager.getInstance().getClient();
    }

    /**
     * Token Bucket Rate Limiter using a Lua Script for atomicity
     * @param key Unique identifier for the rate limit (e.g., "ratelimit:otp:email@example.com")
     * @param capacity Maximum number of tokens the bucket can hold (e.g., 3)
     * @param refillRateTokens Number of tokens added per refill interval (e.g., 1)
     * @param refillIntervalSeconds Interval in seconds at which tokens are added (e.g., 60 for 1 token per minute)
     * @returns boolean true if allowed, false if rate limit exceeded
     */
    async consume(key: string, capacity: number, refillRateTokens: number, refillIntervalSeconds: number): Promise<boolean> {
        const script = `
            local key = KEYS[1]
            local capacity = tonumber(ARGV[1])
            local refillRate = tonumber(ARGV[2])
            local interval = tonumber(ARGV[3])
            local now = tonumber(ARGV[4])
            
            local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
            local tokens = tonumber(bucket[1])
            local last_refill = tonumber(bucket[2])
            
            if not tokens then
                tokens = capacity
                last_refill = now
            else
                local time_passed = math.max(0, now - last_refill)
                local refill_amount = math.floor(time_passed / interval) * refillRate
                
                if refill_amount > 0 then
                    tokens = math.min(capacity, tokens + refill_amount)
                    last_refill = last_refill + (math.floor(time_passed / interval) * interval)
                end
            end
            
            if tokens >= 1 then
                tokens = tokens - 1
                redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)
                redis.call('EXPIRE', key, math.ceil(capacity / refillRate) * interval)
                return 1
            else
                redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)
                redis.call('EXPIRE', key, math.ceil(capacity / refillRate) * interval)
                return 0
            end
        `;
        
        const now = Math.floor(Date.now() / 1000);
        const result = await this.client.eval(script, {
            keys: [key],
            arguments: [
                capacity.toString(), 
                refillRateTokens.toString(), 
                refillIntervalSeconds.toString(), 
                now.toString()
            ]
        });
        
        return result === 1;
    }
}

export const rateLimiter = new RateLimiter();

