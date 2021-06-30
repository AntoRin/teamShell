import { Router } from "express";
import { handleNotifications } from "../utils/notificationHandler";
import { issueServiceClient } from "../services/issue.service";

const router = Router();

router.get("/details/:IssueID", issueServiceClient.getSingleIssue);

router.get("/snippet/:IssueID", issueServiceClient.getIssueSnippet);

router.post("/create", issueServiceClient.createNewIssue, handleNotifications);

router.put("/bookmark", issueServiceClient.bookmarkIssue);

router.put("/bookmark/remove", issueServiceClient.removeBookmark);

router.put("/close", issueServiceClient.closeIssue);

router.put("/reopen", issueServiceClient.reopenIssue);

router.delete("/delete", issueServiceClient.deleteIssue);

router.post(
   "/solution/create",
   issueServiceClient.createNewSolution,
   handleNotifications
);

router.post(
   "/solution/add-like",
   issueServiceClient.addLikeToSolution,
   handleNotifications
);

router.post("/solution/remove-like", issueServiceClient.removeLikeFromSolution);

export default router;
