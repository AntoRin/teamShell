import { Response } from "express";
import Chat from "../models/Chat";
import ProjectChat from "../models/ProjectChat";
import { AuthenticatedRequest, RequestUserType } from "../types";
import { ThrowsServiceException } from "../decorators/ServiceException";
import { Component } from "express-frills";

@Component()
export class ChatService {
   public constructor() {}

   @ThrowsServiceException
   public async getChatHistory(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername } = req.thisUser as RequestUserType;

      const chatHistory = await Chat.find({ Users: UniqueUsername }, { Messages: 0 }).sort({ updatedAt: -1 });

      const memberList = chatHistory.map(chat => {
         const thisRecipient = chat.Users.find(user => user !== UniqueUsername);
         return thisRecipient;
      });

      return res.json({ status: "ok", data: memberList });
   }

   @ThrowsServiceException
   public async getAllUserChatMessages(req: AuthenticatedRequest, res: Response) {
      const { User1, User2 } = req.query as { User1: string; User2: string };
      const sorter = [User1, User2];
      sorter.sort();
      const ChatID: string = sorter[0] + sorter[1];

      const chat = await Chat.findOne({ ChatID });

      return chat ? res.json({ status: "ok", data: chat }) : res.json({ status: "ok", data: [] });
   }

   @ThrowsServiceException
   public async getAllProjectChatMessages(req: AuthenticatedRequest, res: Response) {
      const projectName = req.params.projectName;

      const chat = await ProjectChat.findOne({
         ProjectName: projectName,
      }).lean();

      if (!chat) return res.json({ status: "ok", data: null });

      const messages = chat.Messages;

      const orderedMessages = messages.reverse();

      return res.json({ status: "ok", data: orderedMessages });
   }
}
