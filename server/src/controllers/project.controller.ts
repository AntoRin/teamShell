import { Router } from "express";
import multer from "multer";
import { handleNotifications } from "../utils/notificationHandler";
import { projectServiceClient } from "../services/project.service";
import { DELETE, GET, POST } from "../decorators/ControllerMethods";
import { RestController } from "../decorators/RestController";

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
class ProjectController {
   private static _controllerInstance: ProjectController | null = null;
   private static router = Router();

   private constructor() {}

   public static get controllerInstance() {
      if (!this._controllerInstance)
         this._controllerInstance = new ProjectController();

      return this._controllerInstance;
   }

   get routerInstance() {
      return ProjectController.router;
   }

   @POST("/create")
   createNewProject() {
      return projectServiceClient.createNewProject;
   }

   @GET("/details/:ProjectName")
   getSingleProject() {
      return projectServiceClient.getSingleProject;
   }

   @GET("/verification-data/:ProjectName")
   getVerificationData() {
      return projectServiceClient.getVerificationData;
   }

   @GET("/snippet/:ProjectName")
   getProjectSnippet() {
      return projectServiceClient.getProjectSnippet;
   }

   @POST("/edit")
   editProject() {
      return projectServiceClient.editProject;
   }

   @POST("/invite/new-user")
   inviteUserToProject() {
      return [projectServiceClient.inviteUserToProject, handleNotifications];
   }

   @GET("/add/new-user/:userSecret")
   addUserToProjectWithUserSecret() {
      return [
         projectServiceClient.addUserToProjectWithUserSecret,
         handleNotifications,
      ];
   }

   @POST("/join/new-user")
   handleUserRequestToJoinProject() {
      return [
         projectServiceClient.handleUserRequestToJoinProject,
         handleNotifications,
      ];
   }

   @GET("/accept/new-user")
   acceptUserToProject() {
      return [projectServiceClient.acceptUserToProject, handleNotifications];
   }

   @POST("/leave/:projectName")
   leaveProject() {
      return [projectServiceClient.leaveProject, handleNotifications];
   }

   @GET("/drive/google/authorize")
   authorizeGoogleDriveUsage() {
      return projectServiceClient.authorizeGoogleDriveUsage;
   }

   @GET("/drive/google/callback")
   handleGoogleDriveAuthorizationCallback() {
      return projectServiceClient.handleGoogleDriveAuthorizationCallback;
   }

   @GET("/drive/google/list-files")
   listAllDriveFiles() {
      return projectServiceClient.listAllDriveFiles;
   }

   @POST("/drive/google/create-file")
   createDriveFile() {
      return [fileParser, projectServiceClient.createDriveFile];
   }

   @DELETE("/drive/google/delete-file")
   deleteFileFromGoogleDrive() {
      return projectServiceClient.deleteFileFromGoogleDrive;
   }

   @POST("/drive/file/add")
   addFileToProjectDrive() {
      return projectServiceClient.addFileToProjectDrive;
   }

   @DELETE("/drive/file/remove")
   removeFileFromProjectDrive() {
      return projectServiceClient.removeFileFromProjectDrive;
   }

   @GET("/drive/files/get/:ProjectName")
   getProjectDriveFiles() {
      return projectServiceClient.getProjectDriveFiles;
   }
}

export default ProjectController.controllerInstance.routerInstance;
