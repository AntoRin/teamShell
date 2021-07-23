import mongoose from "mongoose";
import { NextFunction, Response } from "express";
import { IssueSolutionType } from "../interfaces/IssueModel";
import Issue from "../models/Issue";
import Project from "../models/Project";
import User from "../models/User";
import { AuthenticatedRequest, RequestUserType } from "../types";
import AppError from "../utils/AppError";
import { UserSolutionsType } from "../interfaces/UserModel";
import { ThrowsServiceException } from "../decorators/ServiceException";
import { Component } from "dipress";

@Component()
export class IssueService {
   public constructor() {}

   @ThrowsServiceException
   public async getSingleIssue(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername, Email } = req.thisUser as RequestUserType;
      const _id = req.params.IssueID;

      const user = await User.findOne({ UniqueUsername, Email });
      if (!user) throw new AppError("UnauthorizedRequestError");

      const issue = await Issue.findOne({ _id });

      if (!issue) throw new AppError("BadRequestError");

      const projectMember = user.Projects.find(project => {
         return project._id.toString() === issue.Project_id;
      });

      if (!projectMember) throw new AppError("UnauthorizedRequestError");

      return res.json({ status: "ok", data: issue });
   }

   @ThrowsServiceException
   public async getIssueSnippet(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername, Email } = req.thisUser as RequestUserType;
      const _id = req.params.IssueID;

      const user = await User.findOne({ UniqueUsername, Email });

      if (!user) throw new AppError("UnauthorizedRequestError");

      const issueDetails = await Issue.findOne(
         { _id },
         {
            ProjectContext: 0,
            Solutions: 0,
            updatedAt: 0,
            __v: 0,
         }
      );

      if (!issueDetails) throw new AppError("BadRequestError");

      const projectMember = user.Projects.find(project => {
         return project._id.toString() === issueDetails!.Project_id;
      });

      if (!projectMember) throw new AppError("UnauthorizedRequestError");

      const issueSnippet = {
         ID: issueDetails._id,
         Title: issueDetails.IssueTitle,
         Description: issueDetails.IssueDescription,
         "Created by": issueDetails.Creator.UniqueUsername,
         Active: issueDetails.Active.toString(),
         "Created at": issueDetails.createdAt,
      };

      return res.json({ status: "ok", data: issueSnippet });
   }

   @ThrowsServiceException
   public async createNewIssue(req: AuthenticatedRequest, _: Response, next: NextFunction) {
      const { UniqueUsername, Email } = req.thisUser as RequestUserType;
      const { IssueTitle, IssueDescription, ProjectContext, Project_id, Creator } = req.body;

      const issue = {
         IssueTitle,
         IssueDescription,
         ProjectContext,
         Creator,
         Project_id,
         Active: true,
      };

      if (Creator.UniqueUsername !== UniqueUsername) throw new AppError("UnauthorizedRequestError");

      const newIssue = new Issue(issue);

      await newIssue.save();

      const newIssueId = newIssue._id;

      const userIssueContext = {
         _id: newIssueId,
         IssueTitle,
      };

      await Promise.all([
         Project.updateOne({ _id: Project_id }, { $push: { IssuesRef: { $each: [newIssueId], $position: 0 } } }),
         User.updateOne(
            { UniqueUsername, Email },
            {
               $push: {
                  "Issues.Created": { $each: [userIssueContext], $position: 0 },
               },
            }
         ),
      ]);

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
   }

   @ThrowsServiceException
   public async bookmarkIssue(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const { User_id, User_UniqueUsername, Issue_id, IssueTitle } = req.body;

      const Issue_id_object = new mongoose.mongo.ObjectId(Issue_id);

      const issue = {
         _id: Issue_id_object,
         IssueTitle,
      };

      if (User_UniqueUsername !== UniqueUsername) throw new AppError("UnauthorizedRequestError");
      const user = await User.findOne({ UniqueUsername, _id: User_id });
      if (!user) throw new AppError("UnauthorizedRequestError");

      const bookmarked = user.Issues.Bookmarked.find(bookmark => bookmark._id.toString() === Issue_id_object.toString());

      if (bookmarked) throw new AppError("NoActionRequiredError");

      await User.updateOne({ _id: User_id, UniqueUsername }, { $push: { "Issues.Bookmarked": { $each: [issue], $position: 0 } } });
      return res.json({ status: "ok", data: "Issue bookmarked" });
   }

   @ThrowsServiceException
   public async removeBookmark(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const { User_id, User_UniqueUsername, Issue_id } = req.body;

      const Issue_id_object = new mongoose.mongo.ObjectId(Issue_id);

      if (User_UniqueUsername !== UniqueUsername) throw new AppError("UnauthorizedRequestError");
      const user = await User.findOne({ UniqueUsername, _id: User_id });
      if (!user) throw new AppError("UnauthorizedRequestError");

      const bookmarked = user.Issues.Bookmarked.find(bookmark => bookmark._id.toString() === Issue_id_object.toString());

      const typeCompatiblePullKey = "Issues.Bookmarked" as string;

      if (!bookmarked) throw new AppError("NoActionRequiredError");
      await User.updateOne({ _id: User_id, UniqueUsername }, { $pull: { [typeCompatiblePullKey]: { _id: Issue_id_object } } });
      return res.json({ status: "ok", data: "Bookmark removed" });
   }

   @ThrowsServiceException
   public async closeIssue(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const { Issue_id } = req.body;

      const issue = await Issue.findOne({ _id: Issue_id });
      if (issue?.Creator.UniqueUsername !== UniqueUsername) throw new AppError("UnauthorizedRequestError");
      if (!issue.Active) throw new AppError("NoActionRequiredError");
      await Issue.updateOne({ _id: Issue_id }, { $set: { Active: false } });
      return res.json({ status: "ok", data: "Issue closed" });
   }

   @ThrowsServiceException
   public async reopenIssue(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const { Issue_id } = req.body;

      const issue = await Issue.findOne({ _id: Issue_id });
      if (issue?.Creator.UniqueUsername !== UniqueUsername) throw new AppError("UnauthorizedRequestError");
      if (issue?.Active) throw new AppError("NoActionRequiredError");
      await Issue.updateOne({ _id: Issue_id }, { $set: { Active: true } });
      return res.json({ status: "ok", data: "Issue closed" });
   }

   @ThrowsServiceException
   public async deleteIssue(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const { Issue_id, Project_id } = req.body;
      const issue_id_object = new mongoose.mongo.ObjectId(Issue_id);

      const issue = await Issue.findOne({ _id: Issue_id });
      if (issue?.Creator.UniqueUsername !== UniqueUsername) throw new AppError("UnauthorizedRequestError");

      const typeCompatibleCreatedPullKey = "Issues.Created" as string;
      const typeCompatibleBookmarkedPullKey = "Issues.Bookmarked" as string;

      await Promise.all([
         Issue.deleteOne({ _id: issue_id_object }),
         Project.updateOne({ _id: Project_id }, { $pull: { IssuesRef: issue_id_object } }),
         User.updateOne(
            { UniqueUsername },
            {
               $pull: {
                  [typeCompatibleCreatedPullKey]: { _id: issue_id_object },
               },
            }
         ),
         User.updateOne(
            { UniqueUsername },
            {
               $pull: {
                  [typeCompatibleBookmarkedPullKey]: { _id: issue_id_object },
               },
            }
         ),
      ]);

      return res.json({ status: "ok", data: "Issue deleted" });
   }

   @ThrowsServiceException
   public async createNewSolution(req: AuthenticatedRequest, _: Response, next: NextFunction) {
      const { UniqueUsername, Email } = req.thisUser as RequestUserType;
      const { Issue_id, SolutionBody } = req.body;

      const newSolution: IssueSolutionType = {
         _id: new mongoose.Types.ObjectId(),
         SolutionCreator: UniqueUsername,
         SolutionBody,
      };

      const updatedIssue = await Issue.findOneAndUpdate(
         { _id: Issue_id },
         { $push: { Solutions: { $each: [newSolution], $position: 0 } } },
         {
            returnOriginal: false,
         }
      );

      if (!updatedIssue) throw new AppError("ServerError");

      const newSolutionId = updatedIssue.Solutions[0]._id;

      const UserSolutionContext: UserSolutionsType = {
         _id: newSolutionId,
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
         NotificationLink: `/issue/${updatedIssue._id}#${newSolutionId}`,
         OtherLinks: [],
         metaData: {
            recipientType: "Group",
            groupType: "Project",
            recipient: updatedIssue.ProjectContext,
         },
      };

      req.notifications = [notification];

      return next();
   }

   @ThrowsServiceException
   public async addLikeToSolution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const { user_id, solution_id, solution_creator, issueTitle, issueId } = req.body;

      const userRef = {
         _id: user_id,
         UniqueUsername,
      };

      await Issue.updateOne(
         { "Solutions._id": solution_id },
         {
            $push: {
               "Solutions.$.LikedBy": { $each: [userRef], $position: 0 },
            },
         }
      );

      if (UniqueUsername !== solution_creator) {
         const notification = {
            Initiator: UniqueUsername,
            NotificationTitle: "New Like",
            NotificationType: "Standard",
            NotificationAction: `liked your solution to the issue ${issueTitle}`,
            NotificationLink: `/issue/${issueId}#${solution_id}`,
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
   }

   @ThrowsServiceException
   public async removeLikeFromSolution(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const { solution_id } = req.body;

      const typeCompatiblePullKey = "Solutions.$.LikedBy" as string;

      await Issue.updateOne({ "Solutions._id": solution_id }, { $pull: { [typeCompatiblePullKey]: { UniqueUsername } } });
      return res.json({ status: "ok", data: "Like removed" });
   }

   @ThrowsServiceException
   public async deleteSolution(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const { solutionId } = req.params;

      if (!solutionId) throw new AppError("BadRequestError");

      await Promise.all([
         Issue.updateOne(
            { "Solutions._id": solutionId },
            {
               $pull: {
                  Solutions: { _id: solutionId },
               },
            }
         ),
         User.updateOne(
            { UniqueUsername },
            {
               $pull: {
                  Solutions: { _id: solutionId },
               },
            }
         ),
      ]);

      return res.json({ status: "ok", data: "Solution deleted" });
   }
}
