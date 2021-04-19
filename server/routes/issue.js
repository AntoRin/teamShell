const { Router } = require("express");
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

module.exports = router;
