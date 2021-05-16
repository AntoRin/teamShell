const express = require("express");
const mongoose = require("mongoose");
const socketio = require("socket.io");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cookie = require("cookie");
require("dotenv").config();

//Redis
const {
   redisClient,
   redisGetAsync,
   redisSetAsync,
   redisDelAsync,
} = require("./redisConfig");

//Routes
const authRoute = require("./routes/auth");
const profileRoute = require("./routes/profile");
const organizationRoute = require("./routes/organization");
const projectRoute = require("./routes/project");
const issueRoute = require("./routes/issue");
const chatRoute = require("./routes/chat");

const errorHandler = require("./utils/errorHandler");

//Models
const User = require("./models/User");
const Project = require("./models/Project");
const Issue = require("./models/Issue");
const Chat = require("./models/Chat");

const app = express();

//Middleware
const checkAuth = require("./middleware/checkAuth");
const verifySocketIntegrity = require("./middleware/verifySocketIntegrity");

app.use(express.json({ limit: 500000 }));
app.use(
   cors({
      origin: "http://localhost:3000",
      credentials: true,
   })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../client/build")));

app.use("/auth", authRoute);
app.use("/profile", checkAuth, profileRoute);
app.use("/organization", checkAuth, organizationRoute);
app.use("/project", checkAuth, projectRoute);
app.use("/issue", checkAuth, issueRoute);
app.use("/chat", checkAuth, chatRoute);
app.use("*", (req, res) => {
   res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

//Error handler
app.use(errorHandler);

const port = process.env.PORT || 5000;

//Server and Database connections
mongoose.connect(
   process.env.MONGO_URI,
   {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
   },
   err => {
      if (err) return console.log(err);
      else {
         console.log("[server] Database connection established");

         let server = app.listen(port, () =>
            console.log(`[server] Listening on port ${port}`)
         );

         let io = socketio(server, {
            cors: {
               origin: "http://localhost:3000",
               methods: ["GET", "POST"],
               credentials: true,
            },
         });

         io.use((socket, next) => {
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
         });

         io.use(verifySocketIntegrity);

         io.on("connection", async socket => {
            console.log("Connected: " + socket.id);
            try {
               await redisSetAsync(socket.userName, socket.id);
            } catch (error) {
               console.log(error);
            }

            let UserStatus = User.watch();
            let ProjectStatus = Project.watch();
            let IssueStatus = Issue.watch();

            UserStatus.on("change", () => {
               io.to(socket.id).emit("user-data-change");
            });

            ProjectStatus.on("change", diff => {
               if (diff.operationType === "update") {
                  io.to(socket.id).emit("project-data-change");
               }
            });

            IssueStatus.on("change", () => {
               io.to(socket.id).emit("issue-data-change");
            });

            //Chat
            socket.on("message", async data => {
               let { from, to, content } = data;
               let sender = await redisGetAsync(from);
               let recipient = await redisGetAsync(to);

               let sorter = [from, to];
               sorter.sort();

               let messageData = {
                  Messages: {
                     from,
                     to,
                     content,
                  },
               };

               let newChat = await Chat.findOneAndUpdate(
                  { ChatID: sorter[0] + sorter[1] },
                  {
                     $push: {
                        Messages: {
                           $each: [messageData.Messages],
                           $position: 0,
                        },
                     },
                  },
                  { returnOriginal: false, upsert: true }
               );

               if (recipient) {
                  io.to(sender).to(recipient).emit("new-message", newChat);
               } else {
                  io.to(sender).emit("new-message", newChat);
               }
            });
         });
      }
   }
);
