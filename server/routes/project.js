const { Router } = require("express");
const jwt = require("jsonwebtoken");
const Organization = require("../models/Organization");
const Project = require("../models/Project");
const User = require("../models/User");

const router = Router();

router.post("/create", async (req, res) => {
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

      if (!ParentOrganization) throw "Unauthorized";

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

      return res.json({ status: "ok" });
   } catch (error) {
      console.log(error);
      return res.json({ status: "error", error });
   }
});

router.get("/details/:ProjectName", async (req, res) => {
   let ProjectName = req.params.ProjectName;
   let { UniqueUsername, Email } = req.thisUser;

   try {
      let project = await Project.findOne({ ProjectName });
      if (project === null) throw "Project not found";
      if (project.Members.includes(UniqueUsername)) {
         return res.json({ status: "ok", Project: project });
      } else {
         throw "Unauthorized";
      }
   } catch (error) {
      console.log(error);
      if (error === "Project not found")
         return res.status(404).json({ status: "error", error });

      if (error === "Unauthorized")
         return res.status(401).json({ status: "error", error });

      return res.status(501).json({ status: "error", error });
   }
});

router.post("/edit", async (req, res) => {
   let { ProjectName, ProjectDescription } = req.body;

   try {
      await Project.updateOne({ ProjectName }, { ProjectDescription });
      return res.json({ status: "ok" });
   } catch (error) {
      console.log(error);
      return res.status(401).json({ status: "error", error });
   }
});

router.get("/add/new-user/:userSecret", async (req, res) => {
   console.log("here in add user");

   let { UniqueUsername, Email } = req.thisUser;
   let { userSecret } = req.params;

   try {
      let user = await User.findOne({ UniqueUsername, Email });
      if (!user) throw "User not found";
      let { _id, ProjectName } = jwt.verify(
         userSecret,
         process.env.ORG_JWT_SECRET
      );
      if (_id === user._id.toString()) {
         let checkIsMember = await Project.findOne({ ProjectName });
         if (checkIsMember.Members.includes(user.UniqueUsername))
            throw "User Already Present";

         let parentOrg = await Organization.findOne({
            OrganizationName: checkIsMember.ParentOrganization,
         });

         if (!parentOrg.Members.includes(user.UniqueUsername))
            throw "You are not part of the Organization";

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
         throw "Invalid User Credentials";
      }
   } catch (error) {
      console.log(error);
      return res.status(401).json({ status: "error", error });
   }
});

module.exports = router;
