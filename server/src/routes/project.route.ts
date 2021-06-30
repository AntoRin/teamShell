import { Router } from "express";
import multer from "multer";
import { handleNotifications } from "../utils/notificationHandler";
import { projectServiceClient } from "../services/project.service";

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

router.post("/create", projectServiceClient.createNewProject);

router.get("/details/:ProjectName", projectServiceClient.getSingleProject);

router.get(
   "/verification-data/:ProjectName",
   projectServiceClient.getVerificationData
);

router.get("/snippet/:ProjectName", projectServiceClient.getProjectSnippet);

router.post("/edit", projectServiceClient.editProject);

router.post(
   "/invite/new-user",
   projectServiceClient.inviteUserToProject,
   handleNotifications
);

router.get(
   "/add/new-user/:userSecret",
   projectServiceClient.addUserToProjectWithUserSecret,
   handleNotifications
);

router.post(
   "/join/new-user",
   projectServiceClient.handleUserRequestToJoinProject,
   handleNotifications
);

router.get(
   "/accept/new-user",
   projectServiceClient.acceptUserToProject,
   handleNotifications
);

router.post(
   "/leave/:projectName",
   projectServiceClient.leaveProject,
   handleNotifications
);

router.get(
   "/drive/google/authorize",
   projectServiceClient.authorizeGoogleDriveUsage
);

router.get(
   "/drive/google/callback",
   projectServiceClient.handleGoogleDriveAuthorizationCallback
);

router.get("/drive/google/list-files", projectServiceClient.listAllDriveFiles);

router.post(
   "/drive/google/create-file",
   fileParser,
   projectServiceClient.createDriveFile
);

router.delete(
   "/drive/google/delete-file",
   projectServiceClient.deleteFileFromGoogleDrive
);

router.post("/drive/file/add", projectServiceClient.addFileToProjectDrive);

router.delete(
   "/drive/file/remove",
   projectServiceClient.removeFileFromProjectDrive
);

router.get(
   "/drive/files/get/:ProjectName",
   projectServiceClient.getProjectDriveFiles
);

export default router;
