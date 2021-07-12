import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import * as controllers from "./controllers";
import { socketController } from "./socket-connection/SocketController";
import { UserContextSocket } from "./types";
import { Server } from "http";
import errorHandler from "./utils/errorHandler";
import { ApplicationServer, ErrorHandler, WildcardHandler, Factory, OnServerStartup, OnServerInit, Imports } from "express-frills";

@ApplicationServer(null, 5000, false)
export class Teamshell {
   @Imports
   controllers() {
      return [
         controllers.AuthController,
         controllers.ProfileController,
         controllers.OrganizationController,
         controllers.ProjectController,
         controllers.IssueController,
         controllers.ChatController,
         controllers.MeetController,
      ];
   }

   @OnServerInit
   initializeAppMiddlewares(app: Application) {
      app.use(express.json({ limit: 500000 }));
      app.use(cookieParser());
      app.use(express.static(path.join(__dirname, "../../client/build")));
   }

   @OnServerInit
   async initializeConnections() {
      await mongoose.connect(process.env.MONGO_URI, {
         useUnifiedTopology: true,
         useNewUrlParser: true,
         useCreateIndex: true,
         useFindAndModify: false,
      });
      console.log("[server] Database connection established");
   }

   @OnServerStartup
   initSocketServer(server: Server) {
      const io = new SocketServer(server);
      io.use(socketController.parseCookies);
      io.use(socketController.verifySocketIntegrity);

      io.on("connection", (socket: UserContextSocket) => socketController.initiateListeners(socket, io));
   }

   @WildcardHandler
   catchAll(_: Request, res: Response) {
      res.sendFile(path.join(__dirname, "../../client/build/index.html"));
   }

   @ErrorHandler
   @Factory
   handleErrors() {
      return errorHandler;
   }
}
