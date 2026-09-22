import * as Minio from "minio";
import dotenv from "dotenv";
dotenv.config();


export class MinioManager {

    private static instance: MinioManager;
    private client: Minio.Client;

    private constructor() {
        this.client = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT!,
            port: Number(process.env.MINIO_PORT ?? 9000),
            useSSL: process.env.MINIO_USE_SSL === "true",
            accessKey: process.env.MINIO_ACCESS_KEY!,
            secretKey: process.env.MINIO_SECRET_KEY!,
        });
    }

    public static getInstance(): MinioManager {
        if (!this.instance) {
            this.instance = new MinioManager();
        }

        return this.instance;
    }

    public getClient(): Minio.Client {
        return this.client;
    }

    public async initMinio() {
        const bucketName = process.env.MINIO_BUCKET!;
        try {
            const exists = await this.client.bucketExists(bucketName);
            if (!exists) {
                await this.client.makeBucket(bucketName);
                console.log("MINIO CONNECTED")
            } else {
                console.log("MINIO DISCONNECTED")
            }
        } catch (e) {
            console.log("MINIO INITIALIZATION FAILED")
        }
    }

}




const minioInstance = MinioManager.getInstance()
export const minio = minioInstance.getClient()
