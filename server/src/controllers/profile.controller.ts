import { handleNotifications } from "../utils/notificationHandler";
import multer, { FileFilterCallback } from "multer";
import { profileServiceClient } from "../services/profile.service";
import { RestController, GET, POST, PUT, Factory, OnRequestEntry } from "express-frills";
import checkAuth from "../middleware/checkAuth";

const upload = multer({
   storage: multer.memoryStorage(),
   fileFilter: (_, file, cb: FileFilterCallback) => {
      if (!file || file.mimetype.split("/")[0] !== "image") cb(new Error("Error parsing file"));
      else cb(null, true);
   },
   limits: {
      fileSize: 500000,
   },
});
const imageParser = upload.single("profileImage");

@RestController("/api/profile")
@OnRequestEntry(checkAuth)
export class ProfileController {
   private constructor() {}

   @GET("/details/:UniqueUsername")
   @Factory
   getSingleUser() {
      return profileServiceClient.getSingleUser;
   }

   @GET("/profile-image/:UniqueUsername")
   @Factory
   getUserProfileImage() {
      return profileServiceClient.getUserProfileImage;
   }

   @PUT("/edit")
   @Factory
   editUserProfile() {
      return profileServiceClient.editUserProfile;
   }

   @POST("/uploads/profile-image")
   @Factory
   uploadProfileImage() {
      return [imageParser, profileServiceClient.uploadProfileImage];
   }

   @GET("/notifications")
   @Factory
   getUserNotifications() {
      return profileServiceClient.getUserNotifications;
   }

   @POST("/notifications")
   @Factory
   handleNotifications() {
      return handleNotifications;
   }

   @GET("/notifications/seen")
   @Factory
   updateSeenNotifications() {
      return profileServiceClient.updateSeenNotifications;
   }

   @GET("/search")
   @Factory
   getUserProfilesBasedOnSearchQuery() {
      return profileServiceClient.getUserProfilesBasedOnSearchQuery;
   }

   @GET("/all-contacts")
   @Factory
   getAllUserContacts() {
      return profileServiceClient.getAllUserContacts;
   }
}
