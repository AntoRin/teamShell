const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const {
   redisGetAsync,
   redisSetAsync,
   redisDelAsync,
} = require("./redisConfig");
const User = require("./models/User");
const Project = require("./models/Project");
const Issue = require("./models/Issue");
const Chat = require("./models/Chat");
const ProjectChat = require("./models/ProjectChat");

function parseCookies(socket, next) {
   socket.on("disconnect", async () => {
      console.log("Disconnected");
      try {
         await redisDelAsync(socket.userName);
      } catch (error) {
         console.log(error);
      }
   });

   let unParsedCookies = socket.handshake.headers.cookie;
   let allCookies = cookie.parse(unParsedCookies);
   let token = allCookies.token;
   socket.authToken = token;
   next();
}

function verifySocketIntegrity(socket, next) {
   try {
      let thisUser = jwt.verify(socket.authToken, process.env.JWT_SECRET);
      socket.userName = thisUser.UniqueUsername;
      return next();
   } catch (error) {
      let err = new Error(error.message);
      console.log(err);
      socket.disconnect();
      return next(err);
   }
}

async function initiateListeners(socket, io) {
   console.log("Connected: " + socket.id);
   try {
      await redisSetAsync(socket.userName, socket.id);
   } catch (error) {
      console.log(error);
   }

   let UserStatus = User.watch(
      [
         {
            $match: {
               "fullDocument.UniqueUsername": socket.userName,
            },
         },
      ],
      { fullDocument: "updateLookup" }
   );

   let ProjectStatus = Project.watch(
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

   let IssueStatus = Issue.watch();

   UserStatus.on("change", () => {
      io.to(socket.id).emit("user-data-change");
   });

   ProjectStatus.on("change", () => {
      io.to(socket.id).emit("project-data-change");
   });

   IssueStatus.on("change", () => {
      io.to(socket.id).emit("issue-data-change");
   });

   //Chat
   socket.on("message", async data => {
      let { from, to, content } = data;

      if (from !== socket.userName) return;

      let recipientIdentity = await User.findOne({
         UniqueUsername: to,
      });

      if (!recipientIdentity) return;

      let sender = await redisGetAsync(from);
      let recipient = await redisGetAsync(to);

      let sorter = [from, to];
      sorter.sort();

      let messageData = {
         from,
         to,
         content,
      };

      let newChat = await Chat.findOneAndUpdate(
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
         io.to(sender)
            .to(recipient)
            .emit(`new-message-${sorter[0]}${sorter[1]}`, newChat);
      } else {
         io.to(sender).emit(`new-message-${sorter[0]}${sorter[1]}`, newChat);
      }
   });

   //Project Chat
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

         let newMessageData = {
            from,
            content,
            messageType,
         };

         let newMessage = await ProjectChat.findOneAndUpdate(
            { ProjectName },
            { $push: { Messages: { $each: [newMessageData], $position: 0 } } },
            { returnOriginal: false, upsert: true }
         );
         io.to(`project-room-${ProjectName}`).emit(
            "new-incoming-message",
            newMessage.Messages[0]
         );
      } catch (error) {
         console.log(error);
      }
   });

   //Meet
   socket.on("join-meet-room", roomId => socket.join(roomId));

   socket.on("leave-meet-room", roomId => socket.leave(roomId));

   socket.on("new-peer-joined", ({ peerName, roomId }) =>
      socket.to(roomId).emit("new-peer", peerName)
   );

   socket.on("call-offer", ({ offer, roomId }) =>
      socket.to(roomId).emit("call-offer", offer)
   );

   socket.on("call-offer-specific-peer", ({ offer, roomId, peerName }) =>
      socket.to(roomId).emit(`call-offer-${peerName}`, offer)
   );

   socket.on("call-answer", ({ answer, roomId }) =>
      socket.to(roomId).emit("call-answer", answer)
   );

   socket.on("call-answer-specific-peer", ({ answer, roomId, userName }) =>
      socket.to(roomId).emit(`call-answer-${userName}`, answer)
   );

   socket.on("new-ice-candidate", ({ iceCandidate, roomId }) =>
      socket.to(roomId).emit("new-ice-candidate", iceCandidate)
   );

   socket.on(
      "new-ice-candidate-for-specific-peer",
      ({ iceCandidate, roomId, peerName }) =>
         socket.to(roomId).emit(`new-ice-candidate-${peerName}`, iceCandidate)
   );
}

module.exports = { parseCookies, verifySocketIntegrity, initiateListeners };
