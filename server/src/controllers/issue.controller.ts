import { handleNotifications } from "../utils/notificationHandler";
import { issueServiceClient } from "../services/issue.service";
import { RestController, GET, POST, PUT, DELETE, Factory, UseMiddlewares } from "express-frills";
import checkAuth from "../middleware/checkAuth";

@RestController("/api/issue")
@UseMiddlewares(checkAuth)
export class IssueController {
   private static _controllerInstance: IssueController | null = null;

   private constructor() {}

   public static get controllerInstance() {
      if (!this._controllerInstance) this._controllerInstance = new IssueController();

      return this._controllerInstance;
   }

   @GET("/details/:IssueID")
   @Factory
   getSingleIssue() {
      return issueServiceClient.getSingleIssue;
   }

   @GET("/snippet/:IssueID")
   @Factory
   getIssueSnippet() {
      return issueServiceClient.getIssueSnippet;
   }

   @POST("/create")
   @Factory
   createNewIssue() {
      return [issueServiceClient.createNewIssue, handleNotifications];
   }

   @PUT("/bookmark")
   @Factory
   bookmarkIssue() {
      return issueServiceClient.bookmarkIssue;
   }

   @PUT("/bookmark/remove")
   @Factory
   removeBookmark() {
      return issueServiceClient.removeBookmark;
   }

   @PUT("/close")
   @Factory
   closeIssue() {
      return issueServiceClient.closeIssue;
   }

   @PUT("/reopen")
   @Factory
   reopenIssue() {
      return issueServiceClient.reopenIssue;
   }

   @DELETE("/delete")
   @Factory
   deleteIssue() {
      return issueServiceClient.deleteIssue;
   }

   @POST("/solution/create")
   @Factory
   createNewSolution() {
      return [issueServiceClient.createNewSolution, handleNotifications];
   }

   @POST("/solution/add-like")
   @Factory
   addLikeToSolution() {
      return [issueServiceClient.addLikeToSolution, handleNotifications];
   }

   @POST("/solution/remove-like")
   @Factory
   removeLikeFromSolution() {
      return issueServiceClient.removeLikeFromSolution;
   }

   @DELETE("/solution/delete/:solutionId")
   @Factory
   deleteSolution() {
      return issueServiceClient.deleteSolution;
   }
}
