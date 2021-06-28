import express from "express";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";
import path from "path";
import cookieParser from "cookie-parser";
require("dotenv").config();

//Routes
import authRoute from "./routes/auth";
import profileRoute from "./routes/profile";
import organizationRoute from "./routes/organization";
import projectRoute from "./routes/project";
import issueRoute from "./routes/issue";
import chatRoute from "./routes/chat";
import meetRoute from "./routes/meet";

import errorHandler from "./utils/errorHandler";

const app = express();

//Middleware
import checkAuth from "./middleware/checkAuth";
import {
   parseCookies,
   initiateListeners,
   verifySocketIntegrity,
} from "./socketHandlers";
import { INamedSocket } from "./types";

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

         io.on("connection", (socket: INamedSocket) =>
            initiateListeners(socket, io)
         );
      }
   }
);
