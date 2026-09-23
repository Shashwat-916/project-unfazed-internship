import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middleware/authMiddlware";
import { ConversationController } from "./conversation.Controller";
import { ConversationRepository } from "./conversationRepository";

const conversationRouter = Router();

const conversationRepository = new ConversationRepository();
const conversationController = new ConversationController({ conversationRepository });

// Conversations can be accessed by both clients and therapists
conversationRouter.use(authMiddleware, requireRole(["CLIENT", "THERAPIST"]));

conversationRouter.post("/", conversationController.CreateConversation);
conversationRouter.get("/", conversationController.GetMyConversations);
conversationRouter.get("/:id", conversationController.GetConversationById);

export default conversationRouter;
