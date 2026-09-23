import * as Minio from 'minio';
import multer from 'multer';
import dotenv from 'dotenv';


dotenv.config();

export const multerMemory = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
});

export class MinioUpload {
    private client: Minio.Client;
    private bucketName: string;

    constructor() {
        this.bucketName = process.env.MINIO_BUCKET_NAME || 'unfazed-profiles';
        
        this.client = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: parseInt(process.env.MINIO_PORT || '9000', 10),
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
            secretKey: process.env.MINIO_SECRET_KEY || 'password'
        });
    }

    public async initBucket() {
        try {
            const exists = await this.client.bucketExists(this.bucketName);
            if (!exists) {
                await this.client.makeBucket(this.bucketName, 'us-east-1');
                
                // Set bucket policy for public read access
                const policy = {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Action: ['s3:GetObject'],
                            Effect: 'Allow',
                            Principal: { AWS: ['*'] },
                            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
                        },
                    ],
                };
                await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
                console.log(`Bucket ${this.bucketName} created with public read access.`);
            } else {
                console.log(`MinIO bucket ${this.bucketName} is ready.`);
            }
        } catch (error) {
            console.error('Error initializing MinIO bucket:', error);
            throw error;
        }
    }

    public async upload(buffer: Buffer, folder: string = "UNFAZED_PROFILEs"): Promise<{ secure_url: string }> {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const objectName = `${folder}/${uniqueSuffix}.jpg`; // Assuming jpg for profiles

        try {
            await this.client.putObject(this.bucketName, objectName, buffer);
            
        
            const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
            const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
            const port = process.env.MINIO_PORT || '9000';
            
            const secure_url = `${protocol}://${endpoint}:${port}/${this.bucketName}/${objectName}`;
            
            return { secure_url };
        } catch (error) {
            console.error('MinIO upload error:', error);
            throw error;
        }
    }
    public async generateSignature(folder: string = "UNFAZED_PROFILEs"): Promise<{ url: string }> {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const objectName = `${folder}/${uniqueSuffix}.jpg`;
        const url = await this.client.presignedPutObject(this.bucketName, objectName, 3600);
        return { url };
    }
}
