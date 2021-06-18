const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const multer = require("multer");
const stream = require("stream");

const Organization = require("../models/Organization");
const Project = require("../models/Project");
const User = require("../models/User");
const DriveFile = require("../models/DriveFile");
const { handleNotifications } = require("../utils/notificationHandler");

const AppError = require("../utils/AppError");
const config = require("../config");

const router = Router();

const googleClient = new google.auth.OAuth2({
   clientId: config.googleClientId,
   clientSecret: config.googleClientSecret,
   redirectUri: config.googleDriveRedirectUri,
});

const upload = multer({
   storage: multer.memoryStorage(),
   fileFilter: (req, file, cb) => {
      if (!file) cb(new Error("Error parsing file"), false);
      else cb(null, true);
   },
   limits: {
      fileSize: 500000,
   },
});
const fileParser = upload.single("newDriveFile");

router.post("/create", async (req, res, next) => {
   let { ProjectName, ProjectDescription, ParentOrganization } = req.body;
   let { UniqueUsername, Email } = req.thisUser;

   try {
      let project = new Project({
         ProjectName,
         ProjectDescription,
         ParentOrganization,
         Creator: UniqueUsername,
         Members: [UniqueUsername],
      });

      if (!ParentOrganization) throw new AppError("UnauthorizedRequestError");

      let newProjectData = await project.save();
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
});

router.get("/details/:ProjectName", async (req, res, next) => {
   let ProjectName = req.params.ProjectName;
   let { UniqueUsername } = req.thisUser;

   try {
      let aggregationPipeline = [
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

      let aggregationResult = await Project.aggregate(aggregationPipeline);

      let project = aggregationResult[0];

      let parentOrg = await Organization.findOne({
         OrganizationName: project.ParentOrganization,
      });

      if (parentOrg.Members.includes(UniqueUsername)) {
         return res.json({ status: "ok", Project: project });
      } else {
         throw new AppError("UnauthorizedRequestError");
      }
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.get("/verification-data/:ProjectName", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let ProjectName = req.params.ProjectName;

   try {
      let projectDetails = await Project.findOne(
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
});

router.get("/snippet/:ProjectName", async (req, res, next) => {
   let ProjectName = req.params.ProjectName;

   try {
      let projectDetails = await Project.findOne(
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

      let projectSnippet = {
         "About Project": projectDetails.ProjectDescription,
         "No. of Issues": projectDetails.IssuesRef.length,
         "No. of Members": projectDetails.Members.length,
         "Created by": projectDetails.Creator,
      };

      return res.json({ status: "ok", data: projectSnippet });
   } catch (error) {
      return next(error);
   }
});

router.post("/edit", async (req, res, next) => {
   let { ProjectName, ProjectDescription, InviteOnly } = req.body;

   try {
      await Project.updateOne(
         { ProjectName },
         { $set: { ProjectDescription, InviteOnly } }
      );
      return res.json({ status: "ok" });
   } catch (error) {
      return next(error);
   }
});

router.post(
   "/invite/new-user",
   async (req, res, next) => {
      let { UniqueUsername } = req.thisUser;
      let { recipient, projectName } = req.body;

      try {
         let project = await Project.findOne({
            ProjectName: projectName,
         }).lean();

         if (!project) throw new AppError("BadRequestError");

         if (project.Creator !== UniqueUsername)
            throw new AppError("UnauthorizedRequestError");

         let recipientData = await User.findOne({
            UniqueUsername: recipient,
         }).lean();

         if (!recipientData) throw new AppError("UnauthorizedRequestError");

         let invitationSecret = jwt.sign(
            { _id: recipientData._id, ProjectName: project.ProjectName },
            process.env.ORG_JWT_SECRET
         );

         let inviteLink = `/api/project/add/new-user/${invitationSecret}`;

         let notification = {
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
   },
   handleNotifications
);

router.post(
   "/join/new-user",
   async (req, res, next) => {
      let { UniqueUsername } = req.thisUser;
      let { projectName } = req.body;

      try {
         let project = await Project.findOne({
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

            let notification = {
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
            let notification = {
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
   },
   handleNotifications
);

router.get(
   "/accept/new-user",
   async (req, res, next) => {
      let { newUser, requestedProject } = req.query;
      let { UniqueUsername } = req.thisUser;

      try {
         let project = await Project.findOne({ ProjectName: requestedProject });

         if (!project) throw new AppError("BadRequestError");

         if (project.Creator !== UniqueUsername)
            throw new AppError("UnauthorizedRequestError");

         if (project.Members.includes(newUser))
            throw new AppError("ProjectInvitationReboundError");

         let updatedProject = await Project.findOneAndUpdate(
            { ProjectName: requestedProject },
            { $push: { Members: { $each: [newUser], $position: 0 } } }
         );
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

         let notification1 = {
            Initiator: UniqueUsername,
            NotificationTitle: "",
            NotificationAction: `accepted your request to join the project ${project.ProjectName}`,
            NotificationLink: `/project/${project.ParentOrganization}/${project.ProjectName}`,
            OtherLinks: [],
            metaData: {
               recipientType: "SingleUser",
               recipient: newUser,
            },
         };

         let notification2 = {
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
   },
   handleNotifications
);

router.get("/add/new-user/:userSecret", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;
   let { userSecret } = req.params;

   try {
      let user = await User.findOne({ UniqueUsername, Email });
      if (!user) throw new AppError("UnauthorizedRequestError");
      let { _id, ProjectName } = jwt.verify(
         userSecret,
         process.env.ORG_JWT_SECRET
      );
      if (_id === user._id.toString()) {
         let checkIsMember = await Project.findOne({ ProjectName });
         if (checkIsMember.Members.includes(user.UniqueUsername))
            throw new AppError("ProjectInvitationReboundError");

         let parentOrg = await Organization.findOne({
            OrganizationName: checkIsMember.ParentOrganization,
         });

         if (!parentOrg.Members.includes(user.UniqueUsername))
            throw new AppError("OrganizationAuthFailError");

         let project = await Project.findOneAndUpdate(
            { ProjectName },
            { $push: { Members: user.UniqueUsername } }
         );
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

         return res.json({
            status: "ok",
            data: {
               url: `/project/${project.ParentOrganization}/${project.ProjectName}`,
            },
         });
      } else {
         throw new AppError("AuthenticationError");
      }
   } catch (error) {
      return next(error);
   }
});

router.post(
   "/leave/:projectName",
   async (req, res, next) => {
      let { UniqueUsername, Email } = req.thisUser;
      let projectName = req.params.projectName;

      try {
         let user = await User.findOne({ UniqueUsername, Email }).lean();

         let userInProject = user.Projects.find(
            project => project.ProjectName === projectName
         );

         if (!userInProject) throw new AppError("NoActionRequiredError");

         if (userInProject.status === "creator")
            throw new AppError("IrrevertibleActionError");

         await User.updateOne(
            { UniqueUsername, Email },
            { $pull: { Projects: { ProjectName: projectName } } }
         );

         await Project.updateOne(
            { ProjectName: projectName },
            { $pull: { Members: UniqueUsername } }
         );

         let notification = {
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
   },
   handleNotifications
);

router.get("/drive/google/authorize", async (req, res) => {
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
});

router.get("/drive/google/callback", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   console.log(UniqueUsername);
   try {
      if (req.query.error) throw req.query.error;

      const code = req.query.code;
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
});

router.get("/drive/google/list-files", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;

   try {
      let user = await User.findOne({ UniqueUsername }).lean();
      let refresh_token = user.GoogleRefreshToken;

      googleClient.setCredentials({ refresh_token });

      const drive = google.drive({ version: "v3", auth: googleClient });

      let driveResponse = await drive.files.list({
         corpora: "user",
         fields: "*",
      });

      return res.json({ status: "ok", data: driveResponse });
   } catch (error) {
      console.log(error.name);
      return next(error);
   }
});

router.post("/drive/google/create-file", fileParser, async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;

   try {
      let user = await User.findOne({ UniqueUsername }).lean();
      let refresh_token = user.GoogleRefreshToken;

      let file = req.file;

      if (!file) throw new AppError("UploadFailureError");

      let tempStream = new stream.PassThrough();

      tempStream.end(file.buffer);

      googleClient.setCredentials({ refresh_token });

      let drive = google.drive({ version: "v3", auth: googleClient });

      let driveResponse = await drive.files.create({
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
});

router.delete("/drive/google/delete-file", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { fileId } = req.body;

   try {
      let user = await User.findOne({ UniqueUsername }).lean();
      let refresh_token = user.GoogleRefreshToken;

      googleClient.setCredentials({ refresh_token });

      let drive = google.drive({ version: "v3", auth: googleClient });

      let driveResponse = await drive.files.delete({ fileId });

      await DriveFile.deleteOne({ id: fileId });

      return res.json({ status: "ok", data: driveResponse });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.post("/drive/file/add", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { body: fileData } = req;

   try {
      let user = await User.findOne({ UniqueUsername }).lean();
      let userInProject = user.Projects.find(
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
});

router.delete("/drive/file/remove", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { fileId } = req.body;

   try {
      let file = await DriveFile.findOne({ id: fileId });
      if (file.creator !== UniqueUsername)
         throw new AppError("UnauthorizedRequestError");

      await DriveFile.deleteOne({ id: fileId });

      return res.json({ status: "ok", data: "Removed file from project" });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.get("/drive/files/get/:ProjectName", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let requestedProject = req.params.ProjectName;

   try {
      let user = await User.findOne({ UniqueUsername }).lean();
      let userInProject = user.Projects.find(
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
});

module.exports = router;
