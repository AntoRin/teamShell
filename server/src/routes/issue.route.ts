import { Router } from "express";
import { handleNotifications } from "../utils/notificationHandler";
import { issueServiceClient } from "../services/issue.service";
import { DELETE, GET, POST, PUT } from "../decorators/RestController";

class IssueController {
   private static _controllerInstance: IssueController | null = null;
   private static router = Router();

   private constructor() {}

   public static get controllerInstance() {
      if (!this._controllerInstance)
         this._controllerInstance = new IssueController();

      return this._controllerInstance;
   }

   get routerInstance() {
      return IssueController.router;
   }

   @GET("/details/:IssueID")
   getSingleIssue() {
      return issueServiceClient.getSingleIssue;
   }

   @GET("/snippet/:IssueID")
   getIssueSnippet() {
      return issueServiceClient.getIssueSnippet;
   }

   @POST("/create")
   createNewIssue() {
      return [issueServiceClient.createNewIssue, handleNotifications];
   }

   @PUT("/bookmark")
   bookmarkIssue() {
      return issueServiceClient.bookmarkIssue;
   }

   @PUT("/bookmark/remove")
   removeBookmark() {
      return issueServiceClient.removeBookmark;
   }

   @PUT("/close")
   closeIssue() {
      return issueServiceClient.closeIssue;
   }

   @PUT("/reopen")
   reopenIssue() {
      return issueServiceClient.reopenIssue;
   }

   @DELETE("/delete")
   deleteIssue() {
      return issueServiceClient.deleteIssue;
   }

   @POST("/solution/create")
   createNewSolution() {
      return [issueServiceClient.createNewSolution, handleNotifications];
   }

   @POST("/solution/add-like")
   addLikeToSolution() {
      return [issueServiceClient.addLikeToSolution, handleNotifications];
   }

   @POST("/solution/remove-like")
   removeLikeFromSolution() {
      return issueServiceClient.removeLikeFromSolution;
   }
}

export default IssueController.controllerInstance.routerInstance;
