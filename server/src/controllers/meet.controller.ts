import { RestController, GET, POST, Factory, OnRequestEntry } from "express-frills";
import checkAuth from "../middleware/checkAuth";
import { meetServiceClient } from "../services/meet.service";

@RestController("/api/meet")
@OnRequestEntry(checkAuth)
export class MeetController {
   private constructor() {}

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
