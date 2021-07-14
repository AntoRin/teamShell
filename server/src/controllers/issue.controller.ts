import { handleNotifications } from "../utils/notificationHandler";
import { IssueService } from "../services/issue.service";
import { RestController, GET, POST, PUT, DELETE, Factory, OnRequestEntry } from "express-frills";
import checkAuth from "../middleware/checkAuth";

@RestController("/api/issue")
@OnRequestEntry(checkAuth)
export class IssueController {
   public constructor(private _issueServiceClient: IssueService) {}

   @GET("/details/:IssueID")
   @Factory
   getSingleIssue() {
      return this._issueServiceClient.getSingleIssue;
   }

   @GET("/snippet/:IssueID")
   @Factory
   getIssueSnippet() {
      return this._issueServiceClient.getIssueSnippet;
   }

   @POST("/create")
   @Factory
   createNewIssue() {
      return [this._issueServiceClient.createNewIssue, handleNotifications];
   }

   @PUT("/bookmark")
   @Factory
   bookmarkIssue() {
      return this._issueServiceClient.bookmarkIssue;
   }

   @PUT("/bookmark/remove")
   @Factory
   removeBookmark() {
      return this._issueServiceClient.removeBookmark;
   }

   @PUT("/close")
   @Factory
   closeIssue() {
      return this._issueServiceClient.closeIssue;
   }

   @PUT("/reopen")
   @Factory
   reopenIssue() {
      return this._issueServiceClient.reopenIssue;
   }

   @DELETE("/delete")
   @Factory
   deleteIssue() {
      return this._issueServiceClient.deleteIssue;
   }

   @POST("/solution/create")
   @Factory
   createNewSolution() {
      return [this._issueServiceClient.createNewSolution, handleNotifications];
   }

   @POST("/solution/add-like")
   @Factory
   addLikeToSolution() {
      return [this._issueServiceClient.addLikeToSolution, handleNotifications];
   }

   @POST("/solution/remove-like")
   @Factory
   removeLikeFromSolution() {
      return this._issueServiceClient.removeLikeFromSolution;
   }

   @DELETE("/solution/delete/:solutionId")
   @Factory
   deleteSolution() {
      return this._issueServiceClient.deleteSolution;
   }
}
