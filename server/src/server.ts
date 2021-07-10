import express from "express";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

//Routes
import authController from "./controllers/auth.controller";
import profileController from "./controllers/profile.controller";
import organizationController from "./controllers/organization.controller";
import projectController from "./controllers/project.controller";
import issueController from "./controllers/issue.controller";
import chatController from "./controllers/chat.controller";
import meetController from "./controllers/meet.controller";

import errorHandler from "./utils/errorHandler";

//Middleware
import checkAuth from "./middleware/checkAuth";
import {
   parseCookies,
   verifySocketIntegrity,
   initiateListeners,
} from "./socketHandlers";
import { UserContextSocket } from "./types";

const app = express();

app.use(express.json({ limit: 500000 }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../../client/build")));

app.use(authController);
app.use(checkAuth);
app.use(profileController);
app.use(organizationController);
app.use(projectController);
app.use(issueController);
app.use(chatController);
app.use(meetController);
app.use("*", (_, res) => {
   res.sendFile(path.join(__dirname, "../../client/build/index.html"));
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

         const server = app.listen(port, () =>
            console.log(`[server] Listening on port ${port}`)
         );
         const io = new SocketServer(server);
         io.use(parseCookies);
         io.use(verifySocketIntegrity);

         io.on("connection", (socket: UserContextSocket) =>
            initiateListeners(socket, io)
         );
      }
   }
);
