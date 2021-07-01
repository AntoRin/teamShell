import { Router } from "express";
import { handleNotifications } from "../utils/notificationHandler";
import multer, { FileFilterCallback } from "multer";
import { profileServiceClient } from "../services/profile.service";
import { GET, POST, PUT } from "../decorators/RestController";

const upload = multer({
   storage: multer.memoryStorage(),
   fileFilter: (_, file, cb: FileFilterCallback) => {
      if (!file || file.mimetype.split("/")[0] !== "image")
         cb(new Error("Error parsing file"));
      else cb(null, true);
   },
   limits: {
      fileSize: 500000,
   },
});
const imageParser = upload.single("profileImage");

class ProfileController {
   private static _controllerInstance: ProfileController | null = null;
   private static router = Router();

   private constructor() {}

   public static get controllerInstance() {
      if (!this._controllerInstance)
         this._controllerInstance = new ProfileController();

      return this._controllerInstance;
   }

   get routerInstance() {
      return ProfileController.router;
   }

   @GET("/details/:UniqueUsername")
   getSingleUser() {
      return profileServiceClient.getSingleUser;
   }

   @GET("/profile-image/:UniqueUsername")
   getUserProfileImage() {
      return profileServiceClient.getUserProfileImage;
   }

   @PUT("/edit")
   editUserProfile() {
      return profileServiceClient.editUserProfile;
   }

   @POST("/uploads/profile-image")
   uploadProfileImage() {
      return [imageParser, profileServiceClient.uploadProfileImage];
   }

   @GET("/notifications")
   getUserNotifications() {
      return profileServiceClient.getUserNotifications;
   }

   @POST("/notifications")
   handleNotifications() {
      return handleNotifications;
   }

   @GET("/notifications/seen")
   updateSeenNotifications() {
      return profileServiceClient.updateSeenNotifications;
   }

   @GET("/search")
   getUserProfilesBasedOnSearchQuery() {
      return profileServiceClient.getUserProfilesBasedOnSearchQuery;
   }

   @GET("/all-contacts")
   getAllUserContacts() {
      return profileServiceClient.getAllUserContacts;
   }
}

export default ProfileController.controllerInstance.routerInstance;
