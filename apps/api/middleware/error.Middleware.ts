import type { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/api.error";
import multer from 'multer'


export const ErrorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);


    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: `File upload error: ${err.message}. Please ensure the file field name is correct and size is within limits.`,
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
};