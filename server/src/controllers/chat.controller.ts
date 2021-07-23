import { RestController, GET, Factory, OnRequestEntry } from "dipress";
import checkAuth from "../middleware/checkAuth";
import { ChatService } from "../services/chat.service";

@RestController("/api/chat")
@OnRequestEntry(checkAuth)
export class ChatController {
   public constructor(private _chatServiceClient: ChatService) {}

   @GET("/chat-history")
   @Factory
   getChatHistory() {
      return this._chatServiceClient.getChatHistory;
   }

   @GET("/all-messages")
   @Factory
   getAllUserChatMessages() {
      return this._chatServiceClient.getAllUserChatMessages;
   }

   @GET("/project/:projectName")
   @Factory
   getAllProjectChatMessages() {
      return this._chatServiceClient.getAllProjectChatMessages;
   }
}
