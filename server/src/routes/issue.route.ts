import { Router } from "express";
import { handleNotifications } from "../utils/notificationHandler";
import { IssueService } from "../services/issue.service";

const router = Router();

router.get("/details/:IssueID", IssueService.getSingleIssue);

router.get("/snippet/:IssueID", IssueService.getIssueSnippet);

router.post("/create", IssueService.createNewIssue, handleNotifications);

router.put("/bookmark", IssueService.bookmarkIssue);

router.put("/bookmark/remove", IssueService.removeBookmark);

router.put("/close", IssueService.closeIssue);

router.put("/reopen", IssueService.reopenIssue);

router.delete("/delete", IssueService.deleteIssue);

router.post(
   "/solution/create",
   IssueService.createNewSolution,
   handleNotifications
);

router.post(
   "/solution/add-like",
   IssueService.addLikeToSolution,
   handleNotifications
);

router.post("/solution/remove-like", IssueService.removeLikeFromSolution);

export default router;
