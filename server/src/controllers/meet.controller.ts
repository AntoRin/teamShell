import { Router } from "express";
import { GET, POST } from "../decorators/RestController";
import { meetServiceClient } from "../services/meet.service";

class MeetController {
   private static _controllerInstance: MeetController | null = null;
   private static router = Router();

   private constructor() {}

   public static get controllerInstance() {
      if (!this._controllerInstance)
         this._controllerInstance = new MeetController();

      return this._controllerInstance;
   }

   get routerInstance() {
      return MeetController.router;
   }

   @POST("/create-room")
   createNewRoom() {
      return meetServiceClient.createNewRoom;
   }

   @GET("/verify-room")
   verifyRoom() {
      return meetServiceClient.verifyRoom;
   }

   @GET("/active-rooms/:projectName")
   getActiveRooms() {
      return meetServiceClient.getActiveRooms;
   }
}

export default MeetController.controllerInstance.routerInstance;
