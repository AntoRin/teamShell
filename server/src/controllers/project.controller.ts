import multer from "multer";
import { handleNotifications } from "../utils/notificationHandler";
import { projectServiceClient } from "../services/project.service";
import { RestController, GET, POST, DELETE, Factory, UseMiddlewares } from "express-frills";
import checkAuth from "../middleware/checkAuth";

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

@RestController("/api/project")
@UseMiddlewares(checkAuth)
class ProjectController {
   private static _controllerInstance: ProjectController | null = null;

   private constructor() {}

   public static get controllerInstance() {
      if (!this._controllerInstance) this._controllerInstance = new ProjectController();

      return this._controllerInstance;
   }

   @POST("/create")
   @Factory
   createNewProject() {
      return projectServiceClient.createNewProject;
   }

   @GET("/details/:ProjectName")
   @Factory
   getSingleProject() {
      return projectServiceClient.getSingleProject;
   }

   @GET("/verification-data/:ProjectName")
   @Factory
   getVerificationData() {
      return projectServiceClient.getVerificationData;
   }

   @GET("/snippet/:ProjectName")
   @Factory
   getProjectSnippet() {
      return projectServiceClient.getProjectSnippet;
   }

   @POST("/edit")
   @Factory
   editProject() {
      return projectServiceClient.editProject;
   }

   @POST("/invite/new-user")
   @Factory
   inviteUserToProject() {
      return [projectServiceClient.inviteUserToProject, handleNotifications];
   }

   @GET("/add/new-user/:userSecret")
   @Factory
   addUserToProjectWithUserSecret() {
      return [projectServiceClient.addUserToProjectWithUserSecret, handleNotifications];
   }

   @POST("/join/new-user")
   @Factory
   handleUserRequestToJoinProject() {
      return [projectServiceClient.handleUserRequestToJoinProject, handleNotifications];
   }

   @GET("/accept/new-user")
   @Factory
   acceptUserToProject() {
      return [projectServiceClient.acceptUserToProject, handleNotifications];
   }

   @POST("/leave/:projectName")
   @Factory
   leaveProject() {
      return [projectServiceClient.leaveProject, handleNotifications];
   }

   @GET("/drive/google/authorize")
   @Factory
   authorizeGoogleDriveUsage() {
      return projectServiceClient.authorizeGoogleDriveUsage;
   }

   @GET("/drive/google/callback")
   @Factory
   handleGoogleDriveAuthorizationCallback() {
      return projectServiceClient.handleGoogleDriveAuthorizationCallback;
   }

   @GET("/drive/google/list-files")
   @Factory
   listAllDriveFiles() {
      return projectServiceClient.listAllDriveFiles;
   }

   @POST("/drive/google/create-file")
   @Factory
   createDriveFile() {
      return [fileParser, projectServiceClient.createDriveFile];
   }

   @DELETE("/drive/google/delete-file")
   @Factory
   deleteFileFromGoogleDrive() {
      return projectServiceClient.deleteFileFromGoogleDrive;
   }

   @POST("/drive/file/add")
   @Factory
   addFileToProjectDrive() {
      return projectServiceClient.addFileToProjectDrive;
   }

   @DELETE("/drive/file/remove")
   @Factory
   removeFileFromProjectDrive() {
      return projectServiceClient.removeFileFromProjectDrive;
   }

   @GET("/drive/files/get/:ProjectName")
   @Factory
   getProjectDriveFiles() {
      return projectServiceClient.getProjectDriveFiles;
   }
}

export default ProjectController;
