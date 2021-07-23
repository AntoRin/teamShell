import multer, { FileFilterCallback } from "multer";
import { handleNotifications } from "../utils/notificationHandler";
import { ProjectService } from "../services/project.service";
import { RestController, GET, POST, DELETE, Factory, OnRequestEntry } from "dipress";
import checkAuth from "../middleware/checkAuth";
import { RequestHandler } from "express";

@RestController("/api/project")
@OnRequestEntry(checkAuth)
export class ProjectController {
   private _fileParser: RequestHandler | null = null;

   public constructor(private _projectServiceClient: ProjectService) {
      this._fileParser = multer({
         storage: multer.memoryStorage(),
         fileFilter: (_, file: Express.Multer.File, cb: FileFilterCallback) => {
            if (!file) cb(new Error("Error parsing file"));
            else cb(null, true);
         },
         limits: {
            fileSize: 500000,
         },
      }).single("newDriveFile");
   }

   @POST("/create")
   @Factory
   createNewProject() {
      return this._projectServiceClient.createNewProject;
   }

   @GET("/details/:ProjectName")
   @Factory
   getSingleProject() {
      return this._projectServiceClient.getSingleProject;
   }

   @GET("/verification-data/:ProjectName")
   @Factory
   getVerificationData() {
      return this._projectServiceClient.getVerificationData;
   }

   @GET("/snippet/:ProjectName")
   @Factory
   getProjectSnippet() {
      return this._projectServiceClient.getProjectSnippet;
   }

   @POST("/edit")
   @Factory
   editProject() {
      return this._projectServiceClient.editProject;
   }

   @POST("/invite/new-user")
   @Factory
   inviteUserToProject() {
      return [this._projectServiceClient.inviteUserToProject, handleNotifications];
   }

   @GET("/add/new-user/:userSecret")
   @Factory
   addUserToProjectWithUserSecret() {
      return [this._projectServiceClient.addUserToProjectWithUserSecret, handleNotifications];
   }

   @POST("/join/new-user")
   @Factory
   handleUserRequestToJoinProject() {
      return [this._projectServiceClient.handleUserRequestToJoinProject, handleNotifications];
   }

   @GET("/accept/new-user")
   @Factory
   acceptUserToProject() {
      return [this._projectServiceClient.acceptUserToProject, handleNotifications];
   }

   @POST("/leave/:projectName")
   @Factory
   leaveProject() {
      return [this._projectServiceClient.leaveProject, handleNotifications];
   }

   @GET("/drive/google/authorize")
   @Factory
   authorizeGoogleDriveUsage() {
      return this._projectServiceClient.authorizeGoogleDriveUsage;
   }

   @GET("/drive/google/callback")
   @Factory
   handleGoogleDriveAuthorizationCallback() {
      return this._projectServiceClient.handleGoogleDriveAuthorizationCallback;
   }

   @GET("/drive/google/list-files")
   @Factory
   listAllDriveFiles() {
      return this._projectServiceClient.listAllDriveFiles;
   }

   @POST("/drive/google/create-file")
   @Factory
   createDriveFile() {
      return [this._fileParser, this._projectServiceClient.createDriveFile];
   }

   @DELETE("/drive/google/delete-file")
   @Factory
   deleteFileFromGoogleDrive() {
      return this._projectServiceClient.deleteFileFromGoogleDrive;
   }

   @POST("/drive/file/add")
   @Factory
   addFileToProjectDrive() {
      return this._projectServiceClient.addFileToProjectDrive;
   }

   @DELETE("/drive/file/remove")
   @Factory
   removeFileFromProjectDrive() {
      return this._projectServiceClient.removeFileFromProjectDrive;
   }

   @GET("/drive/files/get/:ProjectName")
   @Factory
   getProjectDriveFiles() {
      return this._projectServiceClient.getProjectDriveFiles;
   }
}
