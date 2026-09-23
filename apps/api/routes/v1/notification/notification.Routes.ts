import { Router } from "express";
import { authMiddleware } from "../../../middleware/authMiddlware";
import { NotificationController } from "./notification.Controller";
import { NotificationRepository } from "./notificationRepository";

const notificationRouter = Router();

const notificationRepository = new NotificationRepository();
const notificationController = new NotificationController({ notificationRepository });

// All notification endpoints require authentication
notificationRouter.use(authMiddleware);

notificationRouter.post("/", notificationController.CreateNotification);
notificationRouter.get("/", notificationController.GetMyNotifications);
notificationRouter.patch("/read-all", notificationController.MarkAllAsRead);
notificationRouter.patch("/:id/read", notificationController.MarkAsRead);
notificationRouter.delete("/:id", notificationController.DeleteNotification);

export default notificationRouter;
