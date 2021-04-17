const { Router } = require("express");
const Project = require("../models/Project");
const router = Router();

router.post("/create", async (req, res) => {
   let {
      IssueTitle,
      IssueDescription,
      ProjectContext,
      project_id,
      Creator,
   } = req.body;

   let issue = {
      IssueTitle,
      IssueDescription,
      ProjectContext,
      Creator,
   };

   try {
      await Project.updateOne(
         { _id: project_id },
         { $push: { Issues: issue } }
      );
      return res.json({ status: "ok" });
   } catch (error) {
      console.log(error);
      return res.json({ status: "error", error });
   }
});

module.exports = router;
