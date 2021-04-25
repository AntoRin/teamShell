const { Router } = require("express");
const User = require("../models/User");
const Project = require("../models/Project");
const router = Router();

router.get("/details/all/:project", async (req, res) => {
   let ProjectName = req.params.project;
   try {
      let project = await Project.findOne({ ProjectName });
      if (!project) throw "Not found";
      let issues = project.Issues;
      return res.json({ status: "ok", Issues: issues });
   } catch (error) {
      console.log(error);
      return res.json({ status: "error", error });
   }
});

router.get("/details/:IssueID", async (req, res) => {
   let { UniqueUsername, Email } = req.thisUser;
   let _id = req.params.IssueID;
   try {
      let user = await User.findOne({ UniqueUsername, Email });
      if (!user) throw "Unauthorized";

      let { Issues } = await Project.findOne(
         { "Issues._id": _id },
         { Issues: { $elemMatch: { _id: _id } }, _id: 0 }
      );
      let issue = Issues[0];
      let projectMember = user.Projects.find(project => {
         return project._id.toString() === issue.Project_id;
      });
      if (!projectMember) throw "Unauthorized";
      return res.json({ status: "ok", data: issue });
   } catch (error) {
      console.log(error);
      res.status(401).json({ status: "error", error });
   }
});

router.post("/create", async (req, res) => {
   let {
      IssueTitle,
      IssueDescription,
      ProjectContext,
      Project_id,
      Creator,
   } = req.body;

   let issue = {
      IssueTitle,
      IssueDescription,
      ProjectContext,
      Creator,
      Project_id,
   };

   try {
      await Project.updateOne(
         { _id: Project_id },
         { $push: { Issues: { $each: [issue], $position: 0 } } }
      );

      return res.json({ status: "ok" });
   } catch (error) {
      console.log(error);
      return res.json({ status: "error", error });
   }
});

router.post("/solution/create", async (req, res) => {
   let { UniqueUsername, Email } = req.thisUser;
   let { Issue_id, Project_id, SolutionBy, SolutionBody } = req.body;

   let newSolution = {
      SolutionBy,
      SolutionBody,
   };

   try {
      if (UniqueUsername !== SolutionBy) throw "Unauthorized";
      await Project.updateOne(
         { _id: Project_id, "Issues._id": Issue_id },
         {
            $push: {
               "Issues.$.Solutions": { $each: [newSolution], $position: 0 },
            },
         }
      );

      return res.json({ status: "ok", data: "" });
   } catch (error) {
      console.log(error);
      res.status(401).json({ status: "error", error });
   }
});

module.exports = router;
