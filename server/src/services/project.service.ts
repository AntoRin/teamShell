import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { userNotification } from "../interfaces/UserModel";
import Organization from "../models/Organization";
import Project from "../models/Project";
import User from "../models/User";
import { AuthenticatedRequest, reqUser } from "../types";
import AppError from "../utils/AppError";
import { google } from "googleapis";
import config from "../config";
import stream from "stream";
import DriveFile from "../models/DriveFile";

const googleClient = new google.auth.OAuth2({
   clientId: config.googleClientId,
   clientSecret: config.googleClientSecret,
   redirectUri: config.googleDriveRedirectUri,
});

export class ProjectService {
   public static async createNewProject(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { ProjectName, ProjectDescription, ParentOrganization } = req.body;
      const { UniqueUsername, Email } = req.thisUser as reqUser;

      try {
         const project = new Project({
            ProjectName,
            ProjectDescription,
            ParentOrganization,
            Creator: UniqueUsername,
            Members: [UniqueUsername],
         });

         if (!ParentOrganization)
            throw new AppError("UnauthorizedRequestError");

         const newProjectData = await project.save();
         await Organization.updateOne(
            { OrganizationName: ParentOrganization },
            { $push: { Projects: { $each: [ProjectName], $position: 0 } } }
         );
         await User.updateOne(
            { UniqueUsername, Email },
            {
               $push: {
                  Projects: {
                     $each: [
                        {
                           _id: newProjectData._id,
                           ProjectName,
                           ParentOrganization,
                           Status: "Creator",
                        },
                     ],
                     $position: 0,
                  },
               },
            }
         );

         return res.json({ status: "ok", data: "" });
      } catch (error) {
         return next(error);
      }
   }

   public static async getSingleProject(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const ProjectName = req.params.ProjectName;
      const { UniqueUsername } = req.thisUser as reqUser;

      try {
         const aggregationPipeline = [
            {
               $match: {
                  ProjectName,
               },
            },
            {
               $lookup: {
                  from: "Issues",
                  let: {
                     ids: "$IssuesRef",
                  },
                  pipeline: [
                     {
                        $match: {
                           $expr: {
                              $in: ["$_id", "$$ids"],
                           },
                        },
                     },
                     {
                        $sort: {
                           createdAt: -1,
                        },
                     },
                  ],
                  as: "Issues",
               },
            },
         ];

         const aggregationResult = await Project.aggregate(aggregationPipeline);

         const project = aggregationResult[0];

         const parentOrg = await Organization.findOne({
            OrganizationName: project.ParentOrganization,
         });

         if (parentOrg?.Members.includes(UniqueUsername)) {
            return res.json({ status: "ok", Project: project });
         } else {
            throw new AppError("UnauthorizedRequestError");
         }
      } catch (error) {
         console.log(error);
         return next(error);
      }
   }

   public static async getVerificationData(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as reqUser;
      const ProjectName = req.params.ProjectName;

      try {
         const projectDetails = await Project.findOne(
            { ProjectName },
            { createdAt: 0, updatedAt: 0, ProjectDescription: 0, IssuesRef: 0 }
         ).lean();

         if (!projectDetails) throw new AppError("BadRequestError");

         if (!projectDetails.Members.includes(UniqueUsername))
            throw new AppError("UnauthorizedRequestError");

         return res.json({ status: "ok", data: projectDetails });
      } catch (error) {
         return next(error);
      }
   }

   public static async getProjectSnippet(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const ProjectName = req.params.ProjectName;

      try {
         const projectDetails = await Project.findOne(
            { ProjectName },
            {
               _id: 0,
               ProjectName: 0,
               ParentOrganization: 0,
               createdAt: 0,
               updatedAt: 0,
            }
         );

         if (!projectDetails) throw new AppError("BadRequestError");

         const projectSnippet = {
            "About Project": projectDetails.ProjectDescription,
            "No. of Issues": projectDetails.IssuesRef.length,
            "No. of Members": projectDetails.Members.length,
            "Created by": projectDetails.Creator,
         };

         return res.json({ status: "ok", data: projectSnippet });
      } catch (error) {
         return next(error);
      }
   }

   public static async editProject(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { ProjectName, ProjectDescription, InviteOnly } = req.body;

      try {
         await Project.updateOne(
            { ProjectName },
            { $set: { ProjectDescription, InviteOnly } }
         );
         return res.json({ status: "ok" });
      } catch (error) {
         return next(error);
      }
   }

   public static async inviteUserToProject(
      req: AuthenticatedRequest,
      _: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as reqUser;
      const { recipient, projectName } = req.body;

      try {
         const project = await Project.findOne({
            ProjectName: projectName,
         }).lean();

         if (!project) throw new AppError("BadRequestError");

         if (project.Creator !== UniqueUsername)
            throw new AppError("UnauthorizedRequestError");

         const recipientData = await User.findOne({
            UniqueUsername: recipient,
         }).lean();

         if (!recipientData) throw new AppError("UnauthorizedRequestError");

         const invitationSecret = jwt.sign(
            { _id: recipientData._id, ProjectName: project.ProjectName },
            process.env.ORG_JWT_SECRET
         );

         const inviteLink = `/api/project/add/new-user/${invitationSecret}`;

         const notification: userNotification = {
            Initiator: UniqueUsername,
            NotificationTitle: "Invitation",
            NotificationType: "Invitation",
            NotificationLink: inviteLink,
            NotificationAction: `invited you to join the project ${project.ProjectName}`,
            OtherLinks: [
               {
                  Name: "Project",
                  Link: `project/${project.ParentOrganization}/${project.ProjectName}`,
               },
            ],
            metaData: {
               recipientType: "SingleUser",
               recipient,
            },
         };

         req.notifications = [notification];

         return next();
      } catch (error) {
         return next(error);
      }
   }

   public static async addUserToProjectWithUserSecret(
      req: AuthenticatedRequest,
      _: Response,
      next: NextFunction
   ) {
      const { UniqueUsername, Email } = req.thisUser as reqUser;
      const { userSecret } = req.params;

      try {
         const user = await User.findOne({ UniqueUsername, Email });
         if (!user) throw new AppError("UnauthorizedRequestError");

         const { _id, ProjectName } = jwt.verify(
            userSecret,
            process.env.ORG_JWT_SECRET
         ) as any;

         if (_id === user._id.toString()) {
            const checkIsMember = await Project.findOne({ ProjectName });

            if (checkIsMember?.Members.includes(user.UniqueUsername))
               throw new AppError("ProjectInvitationReboundError");

            const parentOrg = await Organization.findOne({
               OrganizationName: checkIsMember?.ParentOrganization,
            });

            if (!parentOrg?.Members.includes(user.UniqueUsername))
               throw new AppError("OrganizationAuthFailError");

            const project = await Project.findOneAndUpdate(
               { ProjectName },
               { $push: { Members: user.UniqueUsername } }
            );

            if (!project) throw new AppError("ServerError");

            await User.updateOne(
               { _id: user._id },
               {
                  $push: {
                     Projects: {
                        _id: project._id,
                        ProjectName,
                        Status: "Member",
                        ParentOrganization: project.ParentOrganization,
                     },
                  },
               }
            );

            const notification: userNotification = {
               Initiator: UniqueUsername,
               NotificationTitle: "New User",
               NotificationType: "Standard",
               NotificationAction: `joined the project ${ProjectName}`,
               NotificationLink: `/project/${project.ParentOrganization}/${ProjectName}`,
               OtherLinks: [],
               metaData: {
                  recipientType: "Group",
                  groupType: "Project",
                  recipient: ProjectName,
                  successMessage: {
                     url: `/project/${project.ParentOrganization}/${ProjectName}`,
                  },
               },
            };

            req.notifications = [notification];

            return next();
         } else {
            throw new AppError("AuthenticationError");
         }
      } catch (error) {
         return next(error);
      }
   }

   public static async handleUserRequestToJoinProject(
      req: AuthenticatedRequest,
      _: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as reqUser;
      const { projectName } = req.body;

      try {
         const project = await Project.findOne({
            ProjectName: projectName,
         });
         if (!project) throw new AppError("BadRequestError");

         if (project.Members.includes(UniqueUsername))
            throw new AppError("ProjectInvitationReboundError");

         if (!project.InviteOnly) {
            await Project.findOneAndUpdate(
               { ProjectName: project.ProjectName },
               { $push: { Members: UniqueUsername } }
            );

            await User.updateOne(
               { UniqueUsername },
               {
                  $push: {
                     Projects: {
                        _id: project._id,
                        ProjectName: project.ProjectName,
                        Status: "Member",
                        ParentOrganization: project.ParentOrganization,
                     },
                  },
               }
            );

            const notification: userNotification = {
               Initiator: UniqueUsername,
               NotificationTitle: "New User",
               NotificationType: "Standard",
               NotificationLink: `/project/${project.ParentOrganization}/${project.ProjectName}`,
               OtherLinks: [],
               NotificationAction: `joined the project ${project.ProjectName}`,
               metaData: {
                  recipientType: "Group",
                  recipient: project.ProjectName,
                  groupType: "Project",
               },
            };

            req.notifications = [notification];

            return next();
         } else {
            const notification: userNotification = {
               Initiator: UniqueUsername,
               NotificationTitle: "Request",
               NotificationType: "Request",
               NotificationLink: `/api/project/accept/new-user?newUser=${UniqueUsername}&requestedProject=${project.ProjectName}`,
               OtherLinks: [],
               NotificationAction: `requested to join the project ${project.ProjectName}`,
               metaData: {
                  recipientType: "SingleUser",
                  recipient: project.Creator,
               },
            };

            req.notifications = [notification];

            return next();
         }
      } catch (error) {
         return next(error);
      }
   }

   public static async acceptUserToProject(
      req: AuthenticatedRequest,
      _: Response,
      next: NextFunction
   ) {
      const { newUser, requestedProject } = req.query as {
         newUser: string;
         requestedProject: string;
      };
      const { UniqueUsername } = req.thisUser as reqUser;

      try {
         const project = await Project.findOne({
            ProjectName: requestedProject,
         });

         if (!project) throw new AppError("BadRequestError");

         if (project.Creator !== UniqueUsername)
            throw new AppError("UnauthorizedRequestError");

         if (project.Members.includes(newUser))
            throw new AppError("ProjectInvitationReboundError");

         const updatedProject = await Project.findOneAndUpdate(
            { ProjectName: requestedProject },
            { $push: { Members: { $each: [newUser], $position: 0 } } }
         );

         if (!updatedProject) throw new AppError("ServerError");

         await User.updateOne(
            { UniqueUsername: newUser },
            {
               $push: {
                  Projects: {
                     $each: [
                        {
                           _id: updatedProject._id,
                           ProjectName: updatedProject.ProjectName,
                           Status: "Member",
                           ParentOrganization:
                              updatedProject.ParentOrganization,
                        },
                     ],
                     $position: 0,
                  },
               },
            }
         );

         const notification1: userNotification = {
            Initiator: UniqueUsername,
            NotificationTitle: "",
            NotificationType: "Standard",
            NotificationAction: `accepted your request to join the project ${project.ProjectName}`,
            NotificationLink: `/project/${project.ParentOrganization}/${project.ProjectName}`,
            OtherLinks: [],
            metaData: {
               recipientType: "SingleUser",
               recipient: newUser,
            },
         };

         const notification2: userNotification = {
            Initiator: newUser,
            NotificationTitle: "New User",
            NotificationType: "Standard",
            NotificationAction: `joined the project ${project.ProjectName}`,
            NotificationLink: `/project/${project.ParentOrganization}/${project.ProjectName}`,
            OtherLinks: [],
            metaData: {
               recipientType: "Group",
               groupType: "Project",
               recipient: project.ProjectName,
            },
         };

         req.notifications = [notification1, notification2];

         return next();
      } catch (error) {
         return next(error);
      }
   }

   public static async leaveProject(
      req: AuthenticatedRequest,
      _: Response,
      next: NextFunction
   ) {
      const { UniqueUsername, Email } = req.thisUser as reqUser;
      const projectName = req.params.projectName;

      try {
         const user = await User.findOne({ UniqueUsername, Email }).lean();

         const userInProject = user?.Projects.find(
            project => project.ProjectName === projectName
         );

         if (!userInProject) throw new AppError("NoActionRequiredError");

         if (userInProject.Status === "Creator")
            throw new AppError("IrrevertibleActionError");

         await User.updateOne(
            { UniqueUsername, Email },
            { $pull: { Projects: { ProjectName: projectName } } }
         );

         await Project.updateOne(
            { ProjectName: projectName },
            { $pull: { Members: UniqueUsername } }
         );

         const notification = {
            Initiator: UniqueUsername,
            NotificationTitle: "",
            NotificationType: "Standard",
            NotificationLink: `/user/profile/${UniqueUsername}`,
            OtherLinks: [],
            NotificationAction: `left the project ${projectName}`,
            metaData: {
               recipientType: "Group",
               groupType: "Project",
               recipient: projectName,
            },
         };

         req.notifications = [notification];

         return next();
      } catch (error) {
         return next(error);
      }
   }

   public static async authorizeGoogleDriveUsage(
      _: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      try {
         const scopes = "https://www.googleapis.com/auth/drive.file";
         const authUrl = googleClient.generateAuthUrl({
            scope: scopes,
            access_type: "offline",
            include_granted_scopes: true,
         });

         return res.redirect(authUrl);
      } catch (error) {
         console.log(error);
         return next(error);
      }
   }

   public static async handleGoogleDriveAuthorizationCallback(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as reqUser;
      console.log(UniqueUsername);
      try {
         if (req.query.error) throw req.query.error;

         const code = req.query.code as string;
         const { tokens } = await googleClient.getToken(code);

         console.log(tokens.scope);

         if (tokens.refresh_token) {
            console.log("Got refToken: ", tokens.refresh_token);
            await User.updateOne(
               { UniqueUsername },
               { GoogleRefreshToken: tokens.refresh_token }
            );
         }

         return res.redirect("/user/environment");
      } catch (error) {
         console.log(error);
         return next(error);
      }
   }

   public static async listAllDriveFiles(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as reqUser;

      try {
         const user = await User.findOne({ UniqueUsername }).lean();
         const refresh_token = user?.GoogleRefreshToken;

         googleClient.setCredentials({ refresh_token });

         const drive = google.drive({ version: "v3", auth: googleClient });

         const driveResponse = await drive.files.list({
            corpora: "user",
            fields: "*",
         });

         return res.json({ status: "ok", data: driveResponse });
      } catch (error) {
         return next(error);
      }
   }

   public static async createDriveFile(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as reqUser;

      try {
         const user = await User.findOne({ UniqueUsername }).lean();
         const refresh_token = user?.GoogleRefreshToken;

         const file = req.file;

         if (!file) throw new AppError("UploadFailureError");

         const tempStream = new stream.PassThrough();

         tempStream.end(file.buffer);

         googleClient.setCredentials({ refresh_token });

         const drive = google.drive({ version: "v3", auth: googleClient });

         const driveResponse = await drive.files.create({
            media: {
               mimeType: file.mimetype,
               body: tempStream,
            },
            requestBody: {
               description: "Testing images",
               name: file.originalname,
               starred: false,
               folderColorRgb: "#666",
            },
         });

         return res.json({ status: "ok", data: driveResponse });
      } catch (error) {
         console.log(error);
         return next(error);
      }
   }

   public static async deleteFileFromGoogleDrive(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as reqUser;
      const { fileId } = req.body;

      try {
         const user = await User.findOne({ UniqueUsername }).lean();
         const refresh_token = user?.GoogleRefreshToken;

         googleClient.setCredentials({ refresh_token });

         const drive = google.drive({ version: "v3", auth: googleClient });

         const driveResponse = await drive.files.delete({ fileId });

         await DriveFile.deleteOne({ id: fileId });

         return res.json({ status: "ok", data: driveResponse });
      } catch (error) {
         console.log(error);
         return next(error);
      }
   }

   public static async addFileToProjectDrive(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      let { UniqueUsername } = req.thisUser as reqUser;
      let { body: fileData } = req;

      try {
         let user = await User.findOne({ UniqueUsername }).lean();
         let userInProject = user?.Projects.find(
            project => project.ProjectName === fileData.project
         );
         if (!userInProject) throw new AppError("UnauthorizedRequestError");

         let driveFile = new DriveFile(fileData);

         await driveFile.save();

         return res.json({ status: "ok", data: "File added to project" });
      } catch (error) {
         console.log(error);
         return next(error);
      }
   }

   public static async removeFileFromProjectDrive(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      let { UniqueUsername } = req.thisUser as reqUser;
      let { fileId } = req.body;

      try {
         let file = await DriveFile.findOne({ id: fileId });
         if (file?.creator !== UniqueUsername)
            throw new AppError("UnauthorizedRequestError");

         await DriveFile.deleteOne({ id: fileId });

         return res.json({ status: "ok", data: "Removed file from project" });
      } catch (error) {
         console.log(error);
         return next(error);
      }
   }

   public static async getProjectDriveFiles(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      let { UniqueUsername } = req.thisUser as reqUser;
      let requestedProject = req.params.ProjectName;

      try {
         let user = await User.findOne({ UniqueUsername }).lean();
         let userInProject = user?.Projects.find(
            project => project.ProjectName === requestedProject
         );

         if (!userInProject) throw new AppError("UnauthorizedRequestError");

         let files = await DriveFile.find({ project: requestedProject })
            .lean()
            .sort({ createdTime: -1 });

         return res.json({ status: "ok", data: files });
      } catch (error) {
         return next(error);
      }
   }
}
