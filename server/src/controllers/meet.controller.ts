import { RestController, GET, POST, Factory, OnRequestEntry } from "dipress";
import checkAuth from "../middleware/checkAuth";
import { MeetService } from "../services/meet.service";

@RestController("/api/meet")
@OnRequestEntry(checkAuth)
export class MeetController {
   public constructor(private _meetServiceClient: MeetService) {}

   @POST("/create-room")
   @Factory
   createNewRoom() {
      return this._meetServiceClient.createNewRoom;
   }

   @GET("/verify-room")
   @Factory
   verifyRoom() {
      return this._meetServiceClient.verifyRoom;
   }

   @GET("/active-rooms/:projectName")
   @Factory
   getActiveRooms() {
      return this._meetServiceClient.getActiveRooms;
   }
}
