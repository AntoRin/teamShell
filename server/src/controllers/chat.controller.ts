import { RestController, GET, Factory, OnRequestEntry } from "express-frills";
import checkAuth from "../middleware/checkAuth";
import { chatServiceClient } from "../services/chat.service";

@RestController("/api/chat")
@OnRequestEntry(checkAuth)
export class ChatController {
   private constructor() {}

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
