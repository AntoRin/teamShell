import jwt from "jsonwebtoken";
import cookie from "cookie";
import { redisGetAsync, redisSetAsync, redisDelAsync } from "./redisConfig";
import User from "./models/User";
import Project from "./models/Project";
import Issue from "./models/Issue";
import Chat from "./models/Chat";
import ProjectChat from "./models/ProjectChat";
import { UserContextSocket, MessagesType, TokenPayloadType } from "./types";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export function parseCookies(socket: UserContextSocket, next: Function) {
   socket.on("disconnect", async () => {
      console.log("Disconnected");
      try {
         await redisDelAsync(socket.userName);
      } catch (error) {
         console.log(error);
      }
   });

   const unParsedCookies = socket.handshake.headers.cookie!;
   const allCookies = cookie.parse(unParsedCookies);
   const token = allCookies.token;
   socket.authToken = token;
   next();
}

export function verifySocketIntegrity(socket: UserContextSocket, next: Function) {
   try {
      if (!socket.authToken) throw new Error("Invalid auth credentials");

      const thisUser = jwt.verify(socket.authToken, process.env.JWT_SECRET) as TokenPayloadType;
      socket.userName = thisUser.UniqueUsername;
      return next();
   } catch (error: any) {
      const err = new Error(error.message);
      console.log(err);
      socket.disconnect();
      return next(err);
   }
}

export async function initiateListeners(socket: UserContextSocket, io: Server<DefaultEventsMap, DefaultEventsMap>) {
   try {
      await redisSetAsync(socket.userName!, socket.id);
   } catch (error) {
      console.log(error);
      return;
   }

   console.log("Connected: " + socket.id);

   /**
    * TODO: Turn off change stream listeners after socket disconnection
    */
   const UserStatus = User.watch(
      [
         {
            $match: {
               "fullDocument.UniqueUsername": socket.userName,
            },
         },
      ],
      { fullDocument: "updateLookup" }
   );

   const ProjectStatus = Project.watch(
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

   const IssueStatus = Issue.watch();

   UserStatus.on("change", () => {
      io.to(socket.id).emit("user-data-change");
   });

   ProjectStatus.on("change", () => {
      io.to(socket.id).emit("project-data-change");
   });

   IssueStatus.on("change", () => {
      io.to(socket.id).emit("issue-data-change");
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
