const { Router } = require("express");
const Issue = require("../models/Issue");
const router = Router();

router.post("/create", async (req, res) => {
   let {
      IssueTitle,
      IssueDescription,
      ProjectContext,
      project_id,
      Creator,
   } = req.body;

   let issue = new Issue({
      _id: project_id,
      IssueTitle,
      IssueDescription,
      ProjectContext,
      Creator,
   });

   try {
      await issue.save();
      return res.json({ status: "ok" });
   } catch (error) {
      console.log(error);
      return res.json({ status: "error", error });
   }
});

module.exports = router;
