const { Router } = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Project = require("../models/Project");
const Issue = require("../models/Issue");
const { handleNotifications } = require("../utils/notificationHandler");
const router = Router();

const AppError = require("../utils/AppError");

router.get("/details/:IssueID", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;
   let _id = req.params.IssueID;
   try {
      let user = await User.findOne({ UniqueUsername, Email });
      if (!user) throw new AppError("UnauthorizedRequestError");

      let issue = await Issue.findOne({ _id });

      if (!issue) throw new AppError("BadRequestError");

      let projectMember = user.Projects.find(project => {
         return project._id.toString() === issue.Project_id;
      });

      if (!projectMember) throw new AppError("UnauthorizedRequestError");

      return res.json({ status: "ok", data: issue });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.get("/snippet/:IssueID", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;
   let _id = req.params.IssueID;

   try {
      let user = await User.findOne({ UniqueUsername, Email });

      if (!user) throw new AppError("UnauthorizedRequestError");

      let issueDetails = await Issue.findOne(
         { _id },
         {
            ProjectContext: 0,
            Solutions: 0,
            updatedAt: 0,
            __v: 0,
         }
      );

      if (!issueDetails) throw new AppError("BadRequestError");

      let projectMember = user.Projects.find(project => {
         return project._id.toString() === issueDetails.Project_id;
      });

      if (!projectMember) throw new AppError("UnauthorizedRequestError");

      let issueSnippet = {
         ID: issueDetails._id,
         Title: issueDetails.IssueTitle,
         Description: issueDetails.IssueDescription,
         "Created by": issueDetails.Creator.UniqueUsername,
         Active: issueDetails.Active.toString(),
         "Created at": issueDetails.createdAt,
      };

      return res.json({ status: "ok", data: issueSnippet });
   } catch (error) {
      return next(error);
   }
});

router.post(
   "/create",
   async (req, res, next) => {
      let { UniqueUsername, Email } = req.thisUser;
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
         Active: true,
      };

      try {
         if (Creator.UniqueUsername !== UniqueUsername)
            throw new AppError("UnauthorizedRequestError");

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

         let notification = {
            Initiator: UniqueUsername,
            NotificationTitle: "New Issue",
            NotificationType: "Standard",
            NotificationAction: `created a new Issue in the project ${ProjectContext}`,
            NotificationLink: `/issue/${newIssueId}`,
            OtherLinks: [],
            metaData: {
               recipientType: "Group",
               groupType: "Project",
               recipient: ProjectContext,
            },
         };

         req.notifications = [notification];

         return next();
      } catch (error) {
         console.log(error);
         return next(error);
      }
   },
   handleNotifications
);

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
         throw new AppError("UnauthorizedRequestError");
      let user = await User.findOne({ UniqueUsername, _id: User_id });
      if (!user) throw new AppError("UnauthorizedRequestError");

      let bookmarked = user.Issues.Bookmarked.find(
         bookmark => bookmark._id.toString() === Issue_id_object.toString()
      );

      if (bookmarked) throw new AppError("NoActionRequiredError");

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
         throw new AppError("UnauthorizedRequestError");
      let user = await User.findOne({ UniqueUsername, _id: User_id });
      if (!user) throw new AppError("UnauthorizedRequestError");

      let bookmarked = user.Issues.Bookmarked.find(
         bookmark => bookmark._id.toString() === Issue_id_object.toString()
      );

      if (!bookmarked) throw new AppError("NoActionRequiredError");
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
         throw new AppError("UnauthorizedRequestError");
      if (!issue.Active) throw new AppError("NoActionRequiredError");
      await Issue.updateOne({ _id: Issue_id }, { $set: { Active: false } });
      return res.json({ status: "ok", data: "Issue closed" });
   } catch (error) {
      return next(error);
   }
});

router.put("/reopen", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { Issue_id } = req.body;

   try {
      let issue = await Issue.findOne({ _id: Issue_id });
      if (issue.Creator.UniqueUsername !== UniqueUsername)
         throw new AppError("UnauthorizedRequestError");
      if (issue.Active) throw new AppError("NoActionRequiredError");
      await Issue.updateOne({ _id: Issue_id }, { $set: { Active: true } });
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
         throw new AppError("UnauthorizedRequestError");
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

router.post(
   "/solution/create",
   async (req, res, next) => {
      let { UniqueUsername, Email } = req.thisUser;
      let { Issue_id, Project_id, SolutionBody } = req.body;

      let newSolution = {
         SolutionCreator: UniqueUsername,
         SolutionBody,
      };

      try {
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

         let notification = {
            Initiator: UniqueUsername,
            NotificationTitle: "New Solution",
            NotificationType: "Standard",
            NotificationAction: `created a new solution for the Issue ${updatedIssue.IssueTitle}`,
            NotificationLink: `/issue/${updatedIssue._id}`,
            OtherLinks: [],
            metaData: {
               recipientType: "Group",
               groupType: "Project",
               recipient: updatedIssue.ProjectContext,
            },
         };

         req.notifications = [notification];

         return next();
      } catch (error) {
         console.log(error);
         return next(error);
      }
   },
   handleNotifications
);

router.post(
   "/solution/add-like",
   async (req, res, next) => {
      let { UniqueUsername } = req.thisUser;
      let { user_id, solution_id, solution_creator, issueTitle, issueId } =
         req.body;

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

         if (UniqueUsername !== solution_creator) {
            let notification = {
               Initiator: UniqueUsername,
               NotificationTitle: "New Link",
               NotificationType: "Standard",
               NotificationAction: `liked your solution to the issue ${issueTitle}`,
               NotificationLink: `/issue/${issueId}`,
               OtherLinks: [],
               metaDeta: {
                  recipientType: "SingleUser",
                  recipient: solution_creator,
               },
            };

            req.notifications = [notification];

            return next();
         }

         return res.json({ status: "ok", data: "Like added" });
      } catch (error) {
         console.log(error);
         return next(error);
      }
   },
   handleNotifications
);

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
