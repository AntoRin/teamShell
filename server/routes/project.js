const { Router } = require("express");
const jwt = require("jsonwebtoken");
const Organization = require("../models/Organization");
const Project = require("../models/Project");
const User = require("../models/User");

const router = Router();

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

      if (project.Members.includes(UniqueUsername)) {
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
   let { ProjectName, ProjectDescription } = req.body;

   try {
      await Project.updateOne({ ProjectName }, { ProjectDescription });
      return res.json({ status: "ok" });
   } catch (error) {
      return next(error);
   }
});

router.get("/add/new-user/:userSecret", async (req, res, next) => {
   console.log("here in add user");

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

module.exports = router;
