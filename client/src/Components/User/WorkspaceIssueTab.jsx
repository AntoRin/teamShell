import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
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

function WorkspaceIssueTab({ tab, User, activeProject, setActionStatus }) {
   const classes = useStyles();

   const [projectDetails, setProjectDetails] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [accordionExpanded, setAccordionExpanded] = useState(false);

   const socket = useContext(SocketInstance);

   const history = useHistory();

   useEffect(() => {
      if (!activeProject || tab !== "issues") return;

      let abortFetch = new AbortController();

      async function getProjectDetails() {
         setIsLoading(true);
         try {
            let responseStream = await fetch(
               `/api/project/details/${activeProject}`,
               { credentials: "include", signal: abortFetch.signal }
            );

            if (abortFetch.signal.aborted) return;

            let projectData = await responseStream.json();

            if (projectData.status === "ok") {
               let project = projectData.Project;

               setProjectDetails(project);
               setIsLoading(false);
            } else if (projectData.status === "error") throw projectData.error;
         } catch (error) {
            if (error.name !== "AbortError") {
               console.log(error);
               setIsLoading(false);
               history.push("/user/environment");
            }
         }
      }
      getProjectDetails();

      socket.on("project-data-change", () => getProjectDetails());

      return () => {
         abortFetch.abort();
         socket.off("project-data-change");
      };
   }, [activeProject, socket, history, tab]);

   function changeAccordionState() {
      setAccordionExpanded(prev => !prev);
   }

   return tab === "issues" ? (
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
               {projectDetails.Issues &&
                  projectDetails.Issues.length > 0 &&
                  projectDetails.Issues.map(issue => (
                     <IssueCard
                        key={issue._id}
                        User={User}
                        issue={issue}
                        showContent={false}
                        setActionStatus={setActionStatus}
                     />
                  ))}
            </div>
         </div>
         {isLoading && <LinearLoader />}
      </div>
   ) : null;
}

export default WorkspaceIssueTab;
