import { Router } from "express";
import { handleNotifications } from "../utils/notificationHandler";
import multer, { FileFilterCallback } from "multer";
import { ProfileService } from "../services/profile.service";

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

router.get("/details/:UniqueUsername", ProfileService.getSingleUser);

router.get(
   "/profile-image/:UniqueUsername",
   ProfileService.getUserProfileImage
);

router.put("/edit", ProfileService.editUserProfile);

router.post(
   "/uploads/profile-image",
   imageParser,
   ProfileService.uploadProfileImage
);

router.get("/notifications", ProfileService.getUserNotifications);

router.post("/notifications", handleNotifications);

router.get("/notifications/seen", ProfileService.updateSeenNotifications);

router.get("/search", ProfileService.getUserProfilesBasedOnSearchQuery);

router.get("/all-contacts", ProfileService.getAllUserContacts);

export default router;
