import express from "express";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";
import path from "path";
import cookieParser from "cookie-parser";
require("dotenv").config();

//Routes
import authRoute from "./controllers/auth.controller";
import profileRoute from "./controllers/profile.controller";
import organizationRoute from "./controllers/organization.controller";
import projectRoute from "./controllers/project.controller";
import issueRoute from "./controllers/issue.controller";
import chatRoute from "./controllers/chat.controller";
import meetRoute from "./controllers/meet.controller";

import errorHandler from "./utils/errorHandler";

//Middleware
import checkAuth from "./middleware/checkAuth";
import {
   parseCookies,
   initiateListeners,
   verifySocketIntegrity,
} from "./socketHandlers";
import { UserContextSocket } from "./types";

const app = express();

app.use(express.json({ limit: 500000 }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../../client/build")));

app.use("/api/auth", authRoute);
app.use("/api/profile", checkAuth, profileRoute);
app.use("/api/organization", checkAuth, organizationRoute);
app.use("/api/project", checkAuth, projectRoute);
app.use("/api/issue", checkAuth, issueRoute);
app.use("/api/chat", checkAuth, chatRoute);
app.use("/api/meet", checkAuth, meetRoute);
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
