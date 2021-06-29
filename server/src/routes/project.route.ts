import { Router } from "express";
import multer from "multer";
import { handleNotifications } from "../utils/notificationHandler";
import { ProjectService } from "../services/project.service";

const router = Router();

const upload = multer({
   storage: multer.memoryStorage(),
   fileFilter: (_, file, cb) => {
      if (!file) cb(new Error("Error parsing file"));
      else cb(null, true);
   },
   limits: {
      fileSize: 500000,
   },
});
const fileParser = upload.single("newDriveFile");

router.post("/create", ProjectService.createNewProject);

router.get("/details/:ProjectName", ProjectService.getSingleProject);

router.get(
   "/verification-data/:ProjectName",
   ProjectService.getVerificationData
);

router.get("/snippet/:ProjectName", ProjectService.getProjectSnippet);

router.post("/edit", ProjectService.editProject);

router.post(
   "/invite/new-user",
   ProjectService.inviteUserToProject,
   handleNotifications
);

router.get(
   "/add/new-user/:userSecret",
   ProjectService.addUserToProjectWithUserSecret,
   handleNotifications
);

router.post(
   "/join/new-user",
   ProjectService.handleUserRequestToJoinProject,
   handleNotifications
);

router.get(
   "/accept/new-user",
   ProjectService.acceptUserToProject,
   handleNotifications
);

router.post(
   "/leave/:projectName",
   ProjectService.leaveProject,
   handleNotifications
);

router.get("/drive/google/authorize", ProjectService.authorizeGoogleDriveUsage);

router.get(
   "/drive/google/callback",
   ProjectService.handleGoogleDriveAuthorizationCallback
);

router.get("/drive/google/list-files", ProjectService.listAllDriveFiles);

router.post(
   "/drive/google/create-file",
   fileParser,
   ProjectService.createDriveFile
);

router.delete(
   "/drive/google/delete-file",
   ProjectService.deleteFileFromGoogleDrive
);

router.post("/drive/file/add", ProjectService.addFileToProjectDrive);

router.delete("/drive/file/remove", ProjectService.removeFileFromProjectDrive);

router.get(
   "/drive/files/get/:ProjectName",
   ProjectService.getProjectDriveFiles
);

export default router;
