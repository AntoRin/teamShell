import { RestController, GET, Factory, UseMiddlewares } from "express-frills";
import checkAuth from "../middleware/checkAuth";
import { chatServiceClient } from "../services/chat.service";

@RestController("/api/chat")
@UseMiddlewares(checkAuth)
export class ChatController {
   private static _controllerInstance: ChatController | null = null;

   private constructor() {}

   public static get controllerInstance(): ChatController {
      if (!this._controllerInstance) this._controllerInstance = new ChatController();

      return this._controllerInstance;
   }

   @GET("/chat-history")
   @Factory
   getChatHistory() {
      return chatServiceClient.getChatHistory;
   }

   @GET("/all-messages")
   @Factory
   getAllUserChatMessages() {
      return chatServiceClient.getAllUserChatMessages;
   }

   @GET("/project/:projectName")
   @Factory
   getAllProjectChatMessages() {
      return chatServiceClient.getAllProjectChatMessages;
   }
}
