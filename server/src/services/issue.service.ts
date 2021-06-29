import mongoose from "mongoose";
import { NextFunction, Response } from "express";
import { issueSolutions } from "../interfaces/IssueModel";
import Issue from "../models/Issue";
import Project from "../models/Project";
import User from "../models/User";
import { AuthenticatedRequest, reqUser } from "../types";
import AppError from "../utils/AppError";

export class IssueService {
   public static async getSingleIssue(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername, Email } = req.thisUser as reqUser;
      const _id = req.params.IssueID;
      try {
         const user = await User.findOne({ UniqueUsername, Email });
         if (!user) throw new AppError("UnauthorizedRequestError");

         const issue = await Issue.findOne({ _id });

         if (!issue) throw new AppError("BadRequestError");

         const projectMember = user.Projects.find(project => {
            return project._id.toString() === issue.Project_id;
         });

         if (!projectMember) throw new AppError("UnauthorizedRequestError");

         return res.json({ status: "ok", data: issue });
      } catch (error) {
         console.log(error);
         return next(error);
      }
   }

   public static async getIssueSnippet(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername, Email } = req.thisUser as reqUser;
      const _id = req.params.IssueID;

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
            return project._id.toString() === issueDetails!.Project_id;
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
   }

   public static async createNewIssue(
      req: AuthenticatedRequest,
      _: Response,
      next: NextFunction
   ) {
      const { UniqueUsername, Email } = req.thisUser as reqUser;
      const {
         IssueTitle,
         IssueDescription,
         ProjectContext,
         Project_id,
         Creator,
      } = req.body;

      const issue = {
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

         const newIssue = new Issue(issue);

         await newIssue.save();

         const newIssueId = newIssue._id;

         await Project.updateOne(
            { _id: Project_id },
            { $push: { IssuesRef: { $each: [newIssueId], $position: 0 } } }
         );

         const userIssueContext = {
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

         const notification = {
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
   }

   public static async bookmarkIssue(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as reqUser;
      const { User_id, User_UniqueUsername, Issue_id, IssueTitle } = req.body;

      const Issue_id_object = new mongoose.mongo.ObjectId(Issue_id);

      const issue = {
         _id: Issue_id_object,
         IssueTitle,
      };

      try {
         if (User_UniqueUsername !== UniqueUsername)
            throw new AppError("UnauthorizedRequestError");
         const user = await User.findOne({ UniqueUsername, _id: User_id });
         if (!user) throw new AppError("UnauthorizedRequestError");

         const bookmarked = user.Issues.Bookmarked.find(
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
   }

   public static async removeBookmark(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      let { UniqueUsername } = req.thisUser as reqUser;
      let { User_id, User_UniqueUsername, Issue_id } = req.body;

      let Issue_id_object = new mongoose.mongo.ObjectId(Issue_id);

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
   }

   public static async closeIssue(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as reqUser;
      const { Issue_id } = req.body;

      try {
         const issue = await Issue.findOne({ _id: Issue_id });
         if (issue?.Creator.UniqueUsername !== UniqueUsername)
            throw new AppError("UnauthorizedRequestError");
         if (!issue.Active) throw new AppError("NoActionRequiredError");
         await Issue.updateOne({ _id: Issue_id }, { $set: { Active: false } });
         return res.json({ status: "ok", data: "Issue closed" });
      } catch (error) {
         return next(error);
      }
   }

   public static async reopenIssue(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      let { UniqueUsername } = req.thisUser as reqUser;
      let { Issue_id } = req.body;

      try {
         let issue = await Issue.findOne({ _id: Issue_id });
         if (issue?.Creator.UniqueUsername !== UniqueUsername)
            throw new AppError("UnauthorizedRequestError");
         if (issue?.Active) throw new AppError("NoActionRequiredError");
         await Issue.updateOne({ _id: Issue_id }, { $set: { Active: true } });
         return res.json({ status: "ok", data: "Issue closed" });
      } catch (error) {
         return next(error);
      }
   }

   public static async deleteIssue(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      let { UniqueUsername } = req.thisUser as reqUser;
      let { Issue_id, Project_id } = req.body;
      let issue_id_object = new mongoose.mongo.ObjectId(Issue_id);

      try {
         let issue = await Issue.findOne({ _id: Issue_id });
         if (issue?.Creator.UniqueUsername !== UniqueUsername)
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
   }

   public static async createNewSolution(
      req: AuthenticatedRequest,
      _: Response,
      next: NextFunction
   ) {
      const { UniqueUsername, Email } = req.thisUser as reqUser;
      const { Issue_id, SolutionBody } = req.body;

      const newSolution: issueSolutions = {
         SolutionCreator: UniqueUsername,
         SolutionBody,
      };

      try {
         const updatedIssue = await Issue.findOneAndUpdate(
            { _id: Issue_id },
            { $push: { Solutions: { $each: [newSolution], $position: 0 } } },
            {
               returnOriginal: false,
            }
         );

         const newSolutionID = updatedIssue.Solutions[0]._id;

         const UserSolutionContext: userSolutions = {
            _id: newSolutionID,
            IssueContext: {
               _id: updatedIssue?._id,
               IssueTitle: updatedIssue?.IssueTitle,
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

         const notification = {
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
   }

   public static async addLikeToSolution(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      let { UniqueUsername } = req.thisUser as reqUser;
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
               NotificationTitle: "New Like",
               NotificationType: "Standard",
               NotificationAction: `liked your solution to the issue ${issueTitle}`,
               NotificationLink: `/issue/${issueId}`,
               OtherLinks: [],
               metaData: {
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
   }

   public static async removeLikeFromSolution(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as reqUser;
      const { solution_id } = req.body;

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
   }
}
