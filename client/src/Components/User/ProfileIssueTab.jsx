import { makeStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import DetailCard from "./DetailCard";

const useStyles = makeStyles({
   filter: {
      "& h6": {
         color: "white",
      },
      "&": {
         display: "flex",
         justifyContent: "center",
      },
      "& .MuiToggleButton-root": {
         border: "1px solid rgba(109, 98, 190, 0.322)",
         backgroundColor: "transparent",
      },
      "& .Mui-selected": {
         backgroundColor: "#6246ff88",
      },
      "& .Mui-selected:hover": {
         backgroundColor: "#5233ff88",
      },
   },
});

function ProfileIssueTab({
   owner,
   Profile,
   issueTabType,
   handleIssuesTabFilter,
}) {
   const classes = useStyles();

   function filterIssueTab(event, tabFilter) {
      handleIssuesTabFilter(tabFilter);
   }

   return owner ? (
      <>
         <div className="issues-tab-select">
            <ToggleButtonGroup
               className={classes.filter}
               exclusive
               size="small"
               value={issueTabType}
               onChange={filterIssueTab}
            >
               <ToggleButton
                  variant="outlined"
                  color="secondary"
                  value="created"
               >
                  <Typography variant="h6" color="inherit">
                     Created
                  </Typography>
               </ToggleButton>
               <ToggleButton
                  variant="outlined"
                  color="secondary"
                  value="bookmarked"
               >
                  <Typography variant="h6" color="inherit">
                     Bookmarked
                  </Typography>
               </ToggleButton>
            </ToggleButtonGroup>
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
