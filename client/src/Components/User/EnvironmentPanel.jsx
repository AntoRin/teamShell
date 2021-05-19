import { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
import IssueEditor from "./IssueEditor";
import IssueCard from "./IssueCard";
import StatusBar from "../UtilityComponents/StatusBar";
import LinearLoader from "../UtilityComponents/LinearLoader";
import "../../styles/environment-panel.css";
import CenteredLoader from "../UtilityComponents/CenteredLoader";

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
   arrowIcon: {
      color: "white",
   },
}));

function EnvironmentPanel({ User, currentOrg }) {
   const classes = useStyles();
   const [activeProject, setActiveProject] = useState("");
   const [projectDetails, setProjectDetails] = useState({});
   const [accordionExpanded, setAccordionExpanded] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [actionStatus, setActionStatus] = useState({
      type: "success",
      info: null,
   });

   const socket = useContext(SocketInstance);

   useEffect(() => {
      let currentProject = User.Projects.find(
         project => project.ParentOrganization === currentOrg
      );
      if (currentProject) setActiveProject(currentProject.ProjectName);
      else setActiveProject("");
   }, [currentOrg, User.Projects]);

   useEffect(() => {
      let abortFetch = new AbortController();

      async function getProjectDetails() {
         try {
            if (!activeProject) {
               setProjectDetails({});
               setIsLoading(false);
               return;
            }

            let projectRequest = await fetch(
               `/project/details/${activeProject}`,
               { credentials: "include", signal: abortFetch.signal }
            );

            if (abortFetch.signal.aborted) return;

            let projectResponse = await projectRequest.json();

            if (projectResponse.status === "ok") {
               let project = projectResponse.Project;
               setProjectDetails(project);
               setIsLoading(false);
            }
         } catch (error) {
            console.log(error);
         }
      }
      getProjectDetails();

      socket.on("project-data-change", () => getProjectDetails());

      return () => {
         abortFetch.abort();
         socket.off("project-data-change");
      };
   }, [activeProject, socket]);

   useEffect(() => {
      setAccordionExpanded(false);
   }, [currentOrg]);

   function changeActiveProject(event) {
      setActiveProject(event.target.textContent);
   }

   function changeAccordionState() {
      setAccordionExpanded(prev => !prev);
   }

   function currentProjects() {
      if (User.Projects.length < 1)
         return (
            <div className="panel-project-member">
               <h3>No projects yet</h3>
            </div>
         );

      let thisOrgProjects = User.Projects.find(
         project => project.ParentOrganization === currentOrg
      );

      if (!thisOrgProjects)
         return (
            <div className="panel-project-member">
               <h3>You have no projects in this organization</h3>
            </div>
         );

      let projectTitles = User.Projects.map(project => {
         return (
            project.ParentOrganization === currentOrg && (
               <div
                  key={project._id}
                  onClick={changeActiveProject}
                  className={`panel-project-member ${
                     activeProject === project.ProjectName
                        ? "panel-project-active"
                        : ""
                  }`}
               >
                  <h3>{project.ProjectName}</h3>
               </div>
            )
         );
      });
      return projectTitles;
   }
   return !isLoading ? (
      <div className="environment-panel-container">
         <div className="environment-panel-main">
            <div className="panel-project-selection">{currentProjects()}</div>
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
                           aria-controls="panel1a-content"
                           id="panel1a-header"
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
                  {projectDetails.Issues ? (
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
                     <CenteredLoader color="primary" backdrop={true} />
                  )}
               </div>
            </div>
         </div>
         {actionStatus.info && (
            <StatusBar
               actionStatus={actionStatus}
               setActionStatus={setActionStatus}
            />
         )}
      </div>
   ) : (
      <LinearLoader />
   );
}

export default EnvironmentPanel;
