import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middleware/authMiddlware";
import { MessageController } from "./message.Controller";
import { MessageRepository } from "./messageRepository";

const messageRouter = Router({ mergeParams: true });

const messageRepository = new MessageRepository();
const messageController = new MessageController({ messageRepository });

// Both clients and therapists can send/read messages
messageRouter.use(authMiddleware, requireRole(["CLIENT", "THERAPIST"]));

messageRouter.post("/:conversationId", messageController.SendMessage);
messageRouter.get("/:conversationId", messageController.GetMessages);

export default messageRouter;
