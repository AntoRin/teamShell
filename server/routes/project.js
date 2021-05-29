const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const multer = require("multer");

const Organization = require("../models/Organization");
const Project = require("../models/Project");
const User = require("../models/User");
const DriveFile = require("../models/DriveFile");
const { handleNotifications } = require("../utils/notificationHandler");

const router = Router();

const googleClient = new google.auth.OAuth2({
   clientId: process.env.GOOGLE_CLIENT_ID,
   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
   redirectUri: "http://localhost:5000/api/project/drive/google/callback",
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

      if (!ParentOrganization) throw { name: "UnauthorizedRequest" };

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
         throw { name: "UnauthorizedRequest" };
      }
   } catch (error) {
      console.log(error);
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

      if (!projectDetails) throw { name: UnknownData };

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

router.post("/invite/new-user", handleNotifications);

router.post("/accept/new-user", async (req, res, next) => {
   let { newUser, requestedProject } = req.body;
   let { UniqueUsername } = req.thisUser;

   try {
      let project = await Project.findOne({ ProjectName: requestedProject });

      if (!project) throw { name: "UnknownData" };

      if (!project.Creator === UniqueUsername)
         throw { name: "UnauthorizedRequest" };

      if (project.Members.includes(newUser))
         throw { name: "ProjectInvitationRebound" };

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
                        ParentOrganization: updatedProject.ParentOrganization,
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

router.get("/add/new-user/:userSecret", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;
   let { userSecret } = req.params;

   try {
      let user = await User.findOne({ UniqueUsername, Email });
      if (!user) throw { name: "UnauthorizedRequest" };
      let { _id, ProjectName } = jwt.verify(
         userSecret,
         process.env.ORG_JWT_SECRET
      );
      if (_id === user._id.toString()) {
         let checkIsMember = await Project.findOne({ ProjectName });
         if (checkIsMember.Members.includes(user.UniqueUsername))
            throw { name: "ProjectInvitationRebound" };

         let parentOrg = await Organization.findOne({
            OrganizationName: checkIsMember.ParentOrganization,
         });

         if (!parentOrg.Members.includes(user.UniqueUsername))
            throw { name: "OrganizationAuthFail" };

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
         return res.redirect(
            `/project/${project.ParentOrganization}/${project.ProjectName}`
         );
      } else {
         throw { name: "AuthFailure" };
      }
   } catch (error) {
      return next(error);
   }
});

router.post(
   "/join/new-user",
   async (req, res, next) => {
      let { UniqueUsername } = req.thisUser;
      let { initiator, recipient, metaData } = req.body;

      try {
         if (UniqueUsername !== initiator.UniqueUsername)
            throw { name: "UnauthorizedRequest" };

         let project = await Project.findOne({
            ProjectName: metaData.target_name,
         });
         if (!project) throw { name: "UnknownData" };

         if (project.Members.includes(UniqueUsername))
            throw { name: "ProjectInvitationRebound" };

         if (!project.InviteOnly) {
            await Project.findOneAndUpdate(
               { ProjectName: metaData.target_name },
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

            return res.json({ status: "ok", data: "You joined the project" });
         } else {
            req.projectCreator = project.Creator;
            return next();
         }
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

      // console.log(authUrl);
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

      console.log(refresh_token);

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

      if (!file) throw { name: UploadFailure };

      let encodedFile = file.buffer.toString("base64");

      googleClient.setCredentials({ refresh_token });

      let drive = google.drive({ version: "v3", auth: googleClient });

      let driveResponse = await drive.files.create({
         media: {
            mimeType: file.mimetype,
            body: encodedFile,
         },
         requestBody: {
            description: "First file upload",
            mimeType: file.mimetype,
            name: "First file upload",
            starred: true,
            folderColorRgb: "#222",
         },
      });
      if (driveResponse.response.data.error)
         throw driveResponse.response.data.error;

      console.log(driveResponse);

      return res.json({ status: "ok" });
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
      if (!userInProject) throw { name: "UnauthorizedRequest" };

      let driveFile = new DriveFile(fileData);

      await driveFile.save();

      return res.json({ status: "ok", data: "File added to project" });
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

      if (!userInProject) throw { name: "UnauthorizedRequest" };

      let files = await DriveFile.find({ project: requestedProject });

      return res.json({ status: "ok", data: files });
   } catch (error) {
      return next(error);
   }
});

module.exports = router;
