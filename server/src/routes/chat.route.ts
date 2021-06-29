import { Router } from "express";
import { ChatService } from "../services/chat.service";

const router = Router();

router.get("/chat-history", ChatService.getChatHistory);

router.get("/all-messages", ChatService.getAllUserChatMessages);

router.get("/project/:projectName", ChatService.getAllProjectChatMessages);

export default router;
