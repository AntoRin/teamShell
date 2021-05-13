const { Router } = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Project = require("../models/Project");
const Issue = require("../models/Issue");
const router = Router();

router.get("/details/:IssueID", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;
   let _id = req.params.IssueID;
   try {
      let user = await User.findOne({ UniqueUsername, Email });
      if (!user) throw { name: "UnauthorizedRequest" };

      let issue = await Issue.findOne({ _id });

      let projectMember = user.Projects.find(project => {
         return project._id.toString() === issue.Project_id;
      });
      if (!projectMember) throw { name: "UnauthorizedRequest" };
      return res.json({ status: "ok", data: issue });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.post("/create", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;
   let { IssueTitle, IssueDescription, ProjectContext, Project_id, Creator } =
      req.body;

   let issue = {
      IssueTitle,
      IssueDescription,
      ProjectContext,
      Creator,
      Project_id,
      Active: true,
   };

   try {
      if (Creator.UniqueUsername !== UniqueUsername)
         throw { name: "UnauthorizedRequest" };

      let newIssue = new Issue(issue);

      await newIssue.save();

      let newIssueId = newIssue._id;

      await Project.updateOne(
         { _id: Project_id },
         { $push: { IssuesRef: { $each: [newIssueId], $position: 0 } } }
      );

      let userIssueContext = {
         _id: newIssueId,
         IssueTitle,
      };

      await User.updateOne(
         { UniqueUsername, Email },
         {
            $push: {
               "Issues.Created": { $each: [userIssueContext], $position: 0 },
            },
         }
      );

      return res.json({ status: "ok", data: "" });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.put("/bookmark", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { User_id, User_UniqueUsername, Issue_id, IssueTitle } = req.body;

   let Issue_id_object = mongoose.mongo.ObjectId(Issue_id);

   let issue = {
      _id: Issue_id_object,
      IssueTitle,
   };

   try {
      if (User_UniqueUsername !== UniqueUsername)
         throw { name: "UnauthorizedRequest" };
      await User.updateOne(
         { _id: User_id, UniqueUsername },
         { $push: { "Issues.Bookmarked": { $each: [issue], $position: 0 } } }
      );
      return res.json({ status: "ok", data: "Issue bookmarked" });
   } catch (error) {
      return next(error);
   }
});

router.put("/bookmark/remove", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { User_id, User_UniqueUsername, Issue_id } = req.body;

   let Issue_id_object = mongoose.mongo.ObjectId(Issue_id);

   try {
      if (User_UniqueUsername !== UniqueUsername)
         throw { name: "UnauthorizedRequest" };
      await User.updateOne(
         { _id: User_id, UniqueUsername },
         { $pull: { "Issues.Bookmarked": { _id: Issue_id_object } } }
      );
      return res.json({ status: "ok", data: "Bookmark removed" });
   } catch (error) {
      return next(error);
   }
});

router.put("/close", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { Issue_id } = req.body;

   try {
      let issue = await Issue.findOne({ _id: Issue_id });
      if (issue.Creator.UniqueUsername !== UniqueUsername)
         throw { name: "UnauthorizedRequest" };
      await Issue.updateOne({ _id: Issue_id }, { $set: { Active: false } });
      return res.json({ status: "ok", data: "Issue closed" });
   } catch (error) {
      return next(error);
   }
});

router.delete("/delete", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { Issue_id, Project_id } = req.body;
   let issue_id_object = new mongoose.mongo.ObjectId(Issue_id);

   try {
      let issue = await Issue.findOne({ _id: Issue_id });
      if (issue.Creator.UniqueUsername !== UniqueUsername)
         throw { name: "UnauthorizedRequest" };
      await Issue.deleteOne({ _id: issue_id_object });
      await Project.updateOne(
         { _id: Project_id },
         { $pull: { IssuesRef: issue_id_object } }
      );
      await User.updateOne(
         { UniqueUsername },
         {
            $pull: {
               "Issues.Created": { _id: issue_id_object },
            },
         }
      );
      return res.json({ status: "ok", data: "Issue deleted" });
   } catch (error) {
      console.log(error);
      next(error);
   }
});

router.post("/solution/create", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;
   let { Issue_id, Project_id, SolutionCreator, SolutionBody } = req.body;

   let newSolution = {
      SolutionCreator,
      SolutionBody,
   };

   try {
      if (UniqueUsername !== SolutionCreator.UniqueUsername)
         throw { name: "UnauthorizedRequest" };

      let updatedIssue = await Issue.findOneAndUpdate(
         { _id: Issue_id },
         { $push: { Solutions: { $each: [newSolution], $position: 0 } } },
         {
            returnOriginal: false,
         }
      );

      let newSolutionID = updatedIssue.Solutions[0]._id;

      let UserSolutionContext = {
         _id: newSolutionID,
         IssueContext: {
            _id: updatedIssue._id,
            IssueTitle: updatedIssue.IssueTitle,
         },
      };

      await User.updateOne(
         { UniqueUsername, Email },
         {
            $push: {
               Solutions: {
                  $each: [UserSolutionContext],
                  $position: 0,
               },
            },
         }
      );

      return res.json({ status: "ok", data: "" });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.post("/solution/add-like", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { user_id, solution_id } = req.body;

   let userRef = {
      _id: user_id,
      UniqueUsername,
   };

   try {
      await Issue.updateOne(
         { "Solutions._id": solution_id },
         {
            $push: {
               "Solutions.$.LikedBy": { $each: [userRef], $position: 0 },
            },
         }
      );
      return res.json({ status: "ok", data: "Like added" });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.post("/solution/remove-like", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { user_id, solution_id } = req.body;

   let userRef = {
      _id: user_id,
      UniqueUsername,
   };

   try {
      await Issue.updateOne(
         { "Solutions._id": solution_id },
         { $pull: { "Solutions.$.LikedBy": { UniqueUsername } } }
      );
      return res.json({ status: "ok", data: "Like removed" });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

module.exports = router;
