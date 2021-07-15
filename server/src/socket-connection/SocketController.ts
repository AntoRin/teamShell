import mongodb from "mongodb";
import { LeanDocument } from "mongoose";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Chat from "../models/Chat";
import Issue from "../models/Issue";
import Project from "../models/Project";
import ProjectChat from "../models/ProjectChat";
import User from "../models/User";
import { ProjectModel } from "../interfaces/ProjectModel";
import { redisDelAsync, redisGetAsync, redisSetAsync } from "../redisConfig";
import { MessagesType, TokenPayloadType, UserContextSocket } from "../types";

class SocketController {
   private static _ControllerInstance: SocketController | null = null;

   private constructor() {}

   public static get Instance() {
      if (!this._ControllerInstance) this._ControllerInstance = new SocketController();

      return this._ControllerInstance;
   }

   public parseCookies(socket: UserContextSocket, next: Function): void {
      const unParsedCookies = socket.handshake.headers.cookie!;
      const allCookies = cookie.parse(unParsedCookies);
      const token = allCookies.token;
      socket.authToken = token;
      next();
   }

   public verifySocketIntegrity(socket: UserContextSocket, next: Function): void {
      try {
         if (!socket.authToken) throw new Error("Invalid auth credentials");

         const thisUser = jwt.verify(socket.authToken, process.env.JWT_SECRET!) as TokenPayloadType;
         socket.userName = thisUser.UniqueUsername;
         return next();
      } catch (error: any) {
         const err = new Error(error.message);
         console.log(err);
         socket.disconnect();
         return next(err);
      }
   }

   public async initiateListeners(socket: UserContextSocket, io: Server<DefaultEventsMap, DefaultEventsMap>): Promise<void> {
      socket.on("disconnect", () => this.deleteSocketUser(socket));

      try {
         await redisSetAsync(socket.userName!, socket.id);
      } catch (error) {
         console.log(error);
         return;
      }

      console.log("Connected: " + socket.id);

      const UserStatus: mongodb.ChangeStream<any> = User.watch(
         [
            {
               $match: {
                  "fullDocument.UniqueUsername": socket.userName,
               },
            },
         ],
         { fullDocument: "updateLookup" }
      );

      const ProjectStatus: mongodb.ChangeStream<any> = Project.watch(
         [
            {
               $match: {
                  "fullDocument.Members": socket.userName,
               },
            },
         ],
         {
            fullDocument: "updateLookup",
         }
      );

      const IssueStatus: mongodb.ChangeStream<any> = Issue.watch([], {
         fullDocument: "updateLookup",
      });

      socket.on("disconnect", () => this.closeChangeStream(UserStatus, ProjectStatus, IssueStatus));

      UserStatus.on("change", () => io.to(socket.id).emit("user-data-change"));
      ProjectStatus.on("change", () => io.to(socket.id).emit("project-data-change"));

      IssueStatus.on("change", async (doc: any) => {
         if (doc.operationType === "delete") return;
         try {
            const project: LeanDocument<ProjectModel> | null = await Project.findOne({
               _id: doc?.fullDocument.Project_id,
            }).lean();

            if (project?.Members.includes(socket.userName!)) io.to(socket.id).emit("issue-data-change");
         } catch (error) {
            console.log(error);
         }
      });

      /**
       * * Chat listeners
       */
      socket.on("message", async data => {
         try {
            const { from, to, content } = data;

            if (from !== socket.userName) return;

            const recipientIdentity = await User.findOne({
               UniqueUsername: to,
            });

            if (!recipientIdentity) return;

            const sender = await redisGetAsync(from);
            const recipient = await redisGetAsync(to);

            if (!sender) throw new Error("There was an error");

            const sorter = [from, to];
            sorter.sort();

            const messageData: MessagesType = {
               from,
               to,
               content,
            };

            const newChat = await Chat.findOneAndUpdate(
               {
                  ChatID: sorter[0] + sorter[1],
                  Users: [sorter[0], sorter[1]],
               },
               {
                  $push: {
                     Messages: {
                        $each: [messageData],
                        $position: 0,
                     },
                  },
               },
               { returnOriginal: false, upsert: true }
            );

            if (recipient) {
               io.to(sender).to(recipient).emit(`new-message-${sorter[0]}${sorter[1]}`, newChat);
            } else {
               io.to(sender).emit(`new-message-${sorter[0]}${sorter[1]}`, newChat);
            }
         } catch (error) {
            console.log(error);
         }
      });

      /**
       * * Project-chat listeners
       */
      socket.on("join-project-room", projectName => {
         socket.join(`project-room-${projectName}`);
      });

      socket.on("leave-project-room", projectName => {
         socket.leave(`project-room-${projectName}`);
      });

      socket.on("new-project-message", async messageData => {
         try {
            let { from, content, ProjectName, messageType } = messageData;

            if (from !== socket.userName) return;

            if (messageType === "audio") {
               content = content.toString("base64");
            }

            const newMessageData: MessagesType = {
               from,
               content,
               messageType,
            };

            const newMessage = await ProjectChat.findOneAndUpdate(
               { ProjectName },
               { $push: { Messages: { $each: [newMessageData], $position: 0 } } },
               { returnOriginal: false, upsert: true }
            );
            io.to(`project-room-${ProjectName}`).emit("new-incoming-message", newMessage.Messages[0]);
         } catch (error) {
            console.log(error);
         }
      });

      /**
       * * Handle meet room set-up
       */
      socket.on("join-meet-room", roomId => socket.join(roomId));

      socket.on("leave-meet-room", (roomId, peerName) => {
         socket.to(roomId).emit(`peer-${peerName}-left`);
         socket.leave(roomId);
      });

      socket.on("new-peer-joined", ({ peerName, roomId }) => socket.to(roomId).emit("new-peer", peerName));

      socket.on("call-offer-specific-peer", ({ offer, roomId, peerName, callerName }) =>
         socket.to(roomId).emit(`call-offer-${peerName}`, offer, callerName)
      );

      socket.on("call-answer-specific-peer", ({ answer, roomId, userName, callerName }) =>
         socket.to(roomId).emit(`call-answer-${userName}-${callerName}`, answer)
      );

      socket.on("new-ice-candidate-for-specific-peer", ({ iceCandidate, roomId, peerName, callerName }) =>
         socket.to(roomId).emit(`new-ice-candidate-${peerName}-${callerName}`, iceCandidate)
      );
   }

   /**
    * * Socket-disconnect listener function to remove socket session from redis
    */
   private async deleteSocketUser(socket: UserContextSocket): Promise<void> {
      console.log("Disconnected");
      try {
         await redisDelAsync(socket.userName);
      } catch (error) {
         console.log(error);
      }
   }

   /**
    * * Socket-disconnect listener function to close mongo document change streams.
    */
   private async closeChangeStream(...args: mongodb.ChangeStream<any>[]): Promise<void> {
      for (const stream of args) {
         try {
            await stream.close();
         } catch (error) {}
      }
   }
}

export const socketController: SocketController = SocketController.Instance;
