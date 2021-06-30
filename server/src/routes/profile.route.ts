import { Router } from "express";
import { handleNotifications } from "../utils/notificationHandler";
import multer, { FileFilterCallback } from "multer";
import { profileServiceClient } from "../services/profile.service";

const router = Router();

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

router.get("/details/:UniqueUsername", profileServiceClient.getSingleUser);

router.get(
   "/profile-image/:UniqueUsername",
   profileServiceClient.getUserProfileImage
);

router.put("/edit", profileServiceClient.editUserProfile);

router.post(
   "/uploads/profile-image",
   imageParser,
   profileServiceClient.uploadProfileImage
);

router.get("/notifications", profileServiceClient.getUserNotifications);

router.post("/notifications", handleNotifications);

router.get("/notifications/seen", profileServiceClient.updateSeenNotifications);

router.get("/search", profileServiceClient.getUserProfilesBasedOnSearchQuery);

router.get("/all-contacts", profileServiceClient.getAllUserContacts);

export default router;
