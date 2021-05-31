import { useState } from "react";
import { makeStyles } from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IssueEditor from "./IssueEditor";
import IssueCard from "./IssueCard";
import LinearLoader from "../UtilityComponents/LinearLoader";

const useStyles = makeStyles(theme => ({
   root: {
      width: "100%",
      backgroundColor: "#222",
   },
   heading: {
      fontSize: theme.typography.pxToRem(20),
      fontWeight: theme.typography.fontWeightBold,
      color: "red",
      fontFamily: `"Poppins", "sans-serif"`,
   },
}));

function WorkspaceIssueTab({
   User,
   activeProject,
   projectDetails,
   setActionStatus,
   isLoading,
}) {
   const classes = useStyles();

   const [accordionExpanded, setAccordionExpanded] = useState(false);

   function changeAccordionState() {
      setAccordionExpanded(prev => !prev);
   }

   return (
      <div className="environment-panel-main">
         <div className="environment-workspace">
            {activeProject ? (
               <div className="new-issue-division">
                  <Accordion
                     TransitionProps={{ unmountOnExit: true }}
                     className={classes.root}
                     expanded={accordionExpanded}
                     onChange={changeAccordionState}
                  >
                     <AccordionSummary
                        expandIcon={
                           <ExpandMoreIcon className={classes.arrowIcon} />
                        }
                     >
                        <Typography className={classes.heading}>
                           Create a new issue
                        </Typography>
                     </AccordionSummary>
                     <AccordionDetails>
                        <IssueEditor
                           activeProject={activeProject}
                           User={User}
                        />
                     </AccordionDetails>
                  </Accordion>
               </div>
            ) : (
               <h1>Create a project to get started</h1>
            )}
            <div className="all-issues-division">
               {!isLoading ? (
                  projectDetails.Issues &&
                  projectDetails.Issues.length > 0 &&
                  projectDetails.Issues.map(issue => (
                     <IssueCard
                        key={issue._id}
                        User={User}
                        issue={issue}
                        showContent={false}
                        setActionStatus={setActionStatus}
                     />
                  ))
               ) : (
                  <LinearLoader />
               )}
            </div>
         </div>
      </div>
   );
}

export default WorkspaceIssueTab;
