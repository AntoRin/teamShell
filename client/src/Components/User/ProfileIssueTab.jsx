import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import DetailCard from "./DetailCard";

function ProfileIssueTab({
   owner,
   Profile,
   issueTabType,
   handleIssuesTabFilter,
}) {
   return owner ? (
      <>
         <div className="issues-tab-select">
            <ButtonGroup>
               <Button
                  onClick={() => handleIssuesTabFilter("created")}
                  variant="outlined"
                  color="secondary"
               >
                  Created
               </Button>
               <Button
                  onClick={() => handleIssuesTabFilter("bookmarked")}
                  variant="outlined"
                  color="secondary"
               >
                  Bookmarked
               </Button>
            </ButtonGroup>
         </div>
         {issueTabType === "created" && (
            <div className="issues-tab-list">
               {Profile.Issues.Created.map((issue, index) => {
                  return (
                     <DetailCard
                        key={index}
                        header={issue.IssueTitle}
                        detail=""
                     />
                  );
               })}
            </div>
         )}
         {issueTabType === "bookmarked" && (
            <div className="issues-tab-list">
               {Profile.Issues.Bookmarked.map((issue, index) => {
                  return (
                     <DetailCard
                        key={index}
                        header={issue.IssueTitle}
                        detail=""
                     />
                  );
               })}
            </div>
         )}
      </>
   ) : (
      <Typography color="secondary" variant="h4">
         Issues are private
      </Typography>
   );
}

export default ProfileIssueTab;
