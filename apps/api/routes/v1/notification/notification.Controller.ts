import type { AuthRequest } from "../../../middleware/authMiddlware";
import { AsyncHandler } from "../../../shared/api.handler";
import type { Request, Response } from 'express';
import { AppError } from "../../../shared/api.error";
import { NotificationCreateZodValidation } from "@repo/types";
import { NotificationRepository } from "./notificationRepository";

interface INotificationController {
    notificationRepository: NotificationRepository
}

export class NotificationController {
    private notificationRepository: NotificationRepository

    constructor({ notificationRepository }: INotificationController) {
        this.notificationRepository = notificationRepository;
    }

    CreateNotification = AsyncHandler(async (req: AuthRequest, res: Response) => {
        // Typically notifications are generated internally, but exposing it for completeness
        const { data, success, error } = NotificationCreateZodValidation.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Invalid Schema",
                errors: error.issues
            });
        }

        const notification = await this.notificationRepository.CreateNotification(data.userId, data.content);

        return res.status(201).json({
            success: true,
            message: "Notification created",
            data: notification
        });
    });

    GetMyNotifications = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);

        const notifications = await this.notificationRepository.GetNotificationsByUser(userId);

        return res.status(200).json({
            success: true,
            data: notifications
        });
    });

    MarkAsRead = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);

        const notificationId = req.params.id as string;
        if (!notificationId) throw new AppError("Notification ID is required", 400);

        const updated = await this.notificationRepository.MarkAsRead(notificationId, userId);

        if (!updated) {
            throw new AppError("Notification not found or access denied", 404);
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: updated
        });
    });

    MarkAllAsRead = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);

        await this.notificationRepository.MarkAllAsRead(userId);

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    });

    DeleteNotification = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError("Unauthorized", 401);

        const notificationId = req.params.id as string;
        if (!notificationId) throw new AppError("Notification ID is required", 400);

        const deleted = await this.notificationRepository.DeleteNotification(notificationId, userId);

        if (!deleted) {
            throw new AppError("Notification not found or access denied", 404);
        }

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });
    });
}
