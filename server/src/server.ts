import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import AuthController from "./controllers/auth.controller";
import ProfileController from "./controllers/profile.controller";
import OrganizationController from "./controllers/organization.controller";
import ProjectController from "./controllers/project.controller";
import IssueController from "./controllers/issue.controller";
import ChatController from "./controllers/chat.controller";
import MeetController from "./controllers/meet.controller";
import errorHandler from "./utils/errorHandler";
import { parseCookies, verifySocketIntegrity, initiateListeners } from "./socketHandlers";
import { UserContextSocket } from "./types";
import { Server } from "http";

import { ApplicationServer, ErrorHandler, OnResponseEnd, Factory, OnServerActive, OnServerStartup, Imports } from "express-frills";

const app: Application = express();

app.use(express.json({ limit: 500000 }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../../client/build")));

@ApplicationServer(app, 5000, true)
export class Teamshell {
   @Imports
   controllers() {
      return [AuthController, ProfileController, OrganizationController, ProjectController, IssueController, ChatController, MeetController];
   }

   @OnServerStartup
   async initializeConnections() {
      await mongoose.connect(process.env.MONGO_URI, {
         useUnifiedTopology: true,
         useNewUrlParser: true,
         useCreateIndex: true,
         useFindAndModify: false,
      });
      console.log("[server] Database connection established");
   }

   @OnServerActive
   initSocketServer(server: Server) {
      const io = new SocketServer(server);
      io.use(parseCookies);
      io.use(verifySocketIntegrity);

      io.on("connection", (socket: UserContextSocket) => initiateListeners(socket, io));
   }

   @OnResponseEnd
   catchAll(_: Request, res: Response) {
      res.sendFile(path.join(__dirname, "../../client/build/index.html"));
   }

   @ErrorHandler
   @Factory
   handleErrors() {
      return errorHandler;
   }
}
