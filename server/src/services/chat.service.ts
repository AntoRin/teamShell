import { NextFunction, Response } from "express";
import Chat from "../models/Chat";
import ProjectChat from "../models/ProjectChat";
import { AuthenticatedRequest } from "../types";

export class ChatService {
   public static async getChatHistory(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const UniqueUsername = req.thisUser?.UniqueUsername;

      try {
         const chatHistory = await Chat.find(
            { Users: UniqueUsername },
            { Messages: 0 }
         ).sort({ updatedAt: -1 });

         const memberList = chatHistory.map(chat => {
            const thisRecipient = chat.Users.find(
               user => user !== UniqueUsername
            );
            return thisRecipient;
         });

         return res.json({ status: "ok", data: memberList });
      } catch (error) {
         console.log(error);
         return next(error);
      }
   }

   public static async getAllUserChatMessages(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { User1, User2 } = req.query as { User1: string; User2: string };
      const sorter = [User1, User2];
      sorter.sort();
      const ChatID: string = sorter[0] + sorter[1];

      try {
         const chat = await Chat.findOne({ ChatID });

         return chat
            ? res.json({ status: "ok", data: chat })
            : res.json({ status: "ok", data: [] });
      } catch (error) {
         console.log(error);
         return next(error);
      }
   }

   public static async getAllProjectChatMessages(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const projectName = req.params.projectName;

      try {
         const chat = await ProjectChat.findOne({
            ProjectName: projectName,
         }).lean();

         if (!chat) return res.json({ status: "ok", data: null });

         const messages = chat.Messages;

         const orderedMessages = messages.reverse();

         return res.json({ status: "ok", data: orderedMessages });
      } catch (error) {
         console.log(error);
         return next(error);
      }
   }
}
