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
}

module.exports = { parseCookies, verifySocketIntegrity, initiateListeners };
