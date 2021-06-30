import { Router } from "express";
import { chatServiceClient } from "../services/chat.service";

const router = Router();

router.get("/chat-history", chatServiceClient.getChatHistory);

router.get("/all-messages", chatServiceClient.getAllUserChatMessages);

router.get(
   "/project/:projectName",
   chatServiceClient.getAllProjectChatMessages
);

export default router;
