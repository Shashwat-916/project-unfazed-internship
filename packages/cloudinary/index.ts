import { v2 as cloudinary } from "cloudinary";
import multer from 'multer'


import dotenv from "dotenv";
dotenv.config();




export const multerMemory = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
})

export class CloudinaryUpload {

    private client: typeof cloudinary;

    constructor() {
        this.client = cloudinary;
        
        if (process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET) {
            this.client.config({
                cloud_name: process.env.CLOUD_NAME,
                api_key: process.env.API_KEY,
                api_secret: process.env.API_SECRET,
            });
        }
    }

    public async upload(
        buffer: Buffer,
        folder: string = "UNFAZED_PROFILEs"
    ) {

        return new Promise((resolve, reject) => {

            const uploadStream = this.client.uploader.upload_stream(
                {
                    folder,
                    resource_type: "image",
                },

                (error, result) => {

                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(result);
                }
            );

            uploadStream.end(buffer);
        });
    }

    public generateSignature(folder: string = "UNFAZED_PROFILEs") {
        
        const timestamp = Math.round((new Date).getTime() / 1000);
        
        const signature = this.client.utils.api_sign_request(
            {
                timestamp: timestamp,
                folder: folder,
            },
            process.env.API_SECRET!
        );

        return {
            timestamp,
            signature,
            cloudName: process.env.CLOUD_NAME,
            apiKey: process.env.API_KEY,
            folder,
            uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/upload`
        };
    }
}



