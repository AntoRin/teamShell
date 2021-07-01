import { Router } from "express";
import { GET } from "../decorators/RestController";
import { chatServiceClient } from "../services/chat.service";

class ChatController {
   private static _controllerInstance: ChatController | null = null;
   private static router = Router();

   private constructor() {}

   public static get controllerInstance(): ChatController {
      if (!this._controllerInstance)
         this._controllerInstance = new ChatController();

      return this._controllerInstance;
   }

   get routerInstance() {
      return ChatController.router;
   }

   @GET("/chat-history")
   getChatHistory() {
      return chatServiceClient.getChatHistory;
   }

   @GET("/all-messages")
   getAllUserChatMessages() {
      return chatServiceClient.getAllUserChatMessages;
   }

   @GET("/project/:projectName")
   getAllProjectChatMessages() {
      return chatServiceClient.getAllProjectChatMessages;
   }
}

export default ChatController.controllerInstance.routerInstance;
