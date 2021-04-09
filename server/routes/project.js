const { Router } = require("express");
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

      let newProjectData = await project.save();
      await Organization.updateOne(
         { OrganizationName: ParentOrganization },
         { $push: { Projects: ProjectName } }
      );
      await User.updateOne(
         { UniqueUsername, Email },
         {
            $push: {
               Projects: {
                  _id: newProjectData._id,
                  ProjectName,
                  ParentOrganization,
                  Status: "Creator",
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

module.exports = router;
