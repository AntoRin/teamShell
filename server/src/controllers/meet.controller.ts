import { RestController, GET, POST, Factory, UseMiddlewares } from "express-frills";
import checkAuth from "../middleware/checkAuth";
import { meetServiceClient } from "../services/meet.service";

@RestController("/api/meet")
@UseMiddlewares(checkAuth)
export class MeetController {
   private static _controllerInstance: MeetController | null = null;

   private constructor() {}

   public static get controllerInstance() {
      if (!this._controllerInstance) this._controllerInstance = new MeetController();

      return this._controllerInstance;
   }

   @POST("/create-room")
   @Factory
   createNewRoom() {
      return meetServiceClient.createNewRoom;
   }

   @GET("/verify-room")
   @Factory
   verifyRoom() {
      return meetServiceClient.verifyRoom;
   }

   @GET("/active-rooms/:projectName")
   @Factory
   getActiveRooms() {
      return meetServiceClient.getActiveRooms;
   }
}
