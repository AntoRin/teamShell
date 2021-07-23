import { handleNotifications } from "../utils/notificationHandler";
import multer, { FileFilterCallback } from "multer";
import { ProfileService } from "../services/profile.service";
import { RestController, GET, POST, PUT, Factory, OnRequestEntry } from "dipress";
import checkAuth from "../middleware/checkAuth";
import { RequestHandler } from "express";

@RestController("/api/profile")
@OnRequestEntry(checkAuth)
export class ProfileController {
   private _imageParser: RequestHandler | null = null;

   public constructor(private _profileServiceClient: ProfileService) {
      this._imageParser = multer({
         storage: multer.memoryStorage(),
         fileFilter: (_, file: Express.Multer.File, cb: FileFilterCallback) => {
            if (!file || file.mimetype.split("/")[0] !== "image") cb(new Error("Error parsing file"));
            else cb(null, true);
         },
         limits: {
            fileSize: 500000,
         },
      }).single("profileImage");
   }

   @GET("/details/:UniqueUsername")
   @Factory
   getSingleUser() {
      return this._profileServiceClient.getSingleUser;
   }

   @GET("/profile-image/:UniqueUsername")
   @Factory
   getUserProfileImage() {
      return this._profileServiceClient.getUserProfileImage;
   }

   @PUT("/edit")
   @Factory
   editUserProfile() {
      return this._profileServiceClient.editUserProfile;
   }

   @POST("/uploads/profile-image")
   @Factory
   uploadProfileImage() {
      return [this._imageParser, this._profileServiceClient.uploadProfileImage];
   }

   @GET("/notifications")
   @Factory
   getUserNotifications() {
      return this._profileServiceClient.getUserNotifications;
   }

   @POST("/notifications")
   @Factory
   handleNotifications() {
      return handleNotifications;
   }

   @GET("/notifications/seen")
   @Factory
   updateSeenNotifications() {
      return this._profileServiceClient.updateSeenNotifications;
   }

   @GET("/search")
   @Factory
   getUserProfilesBasedOnSearchQuery() {
      return this._profileServiceClient.getUserProfilesBasedOnSearchQuery;
   }

   @GET("/all-contacts")
   @Factory
   getAllUserContacts() {
      return this._profileServiceClient.getAllUserContacts;
   }
}
