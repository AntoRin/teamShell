import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import AssignmentIcon from "@material-ui/icons/Assignment";
import ArrowRightAltIcon from "@material-ui/icons/ArrowRightAlt";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
import IssueEditor from "./IssueEditor";
import IssueCard from "./IssueCard";
import StatusBar from "../UtilityComponents/StatusBar";
import LinearLoader from "../UtilityComponents/LinearLoader";
import "../../styles/environment-panel.css";
import { Breadcrumbs, Tooltip } from "@material-ui/core";

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
   projectSettingsBtn: {
      position: "fixed",
      top: "30%",
      left: "10px",
   },
   environmentCrumbs: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      "& div": {
         cursor: "pointer",
         color: "blue",
      },
   },
}));

function EnvironmentPanel({ User, currentOrg }) {
   const classes = useStyles();

   const [activeProject, setActiveProject] = useState(null);
   const [projectDetails, setProjectDetails] = useState({});
   const [accordionExpanded, setAccordionExpanded] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [actionStatus, setActionStatus] = useState({
      type: "success",
      info: null,
   });
   const [projectSelectOpen, setProjectSelectOpen] = useState(false);

   const history = useHistory();

   const socket = useContext(SocketInstance);

   useEffect(() => {
      if (!User.Projects.length > 0) return;

      let project = User.Projects.find(
         project => project.ParentOrganization === currentOrg
      );
      if (project) setActiveProject(project.ProjectName);
      else setActiveProject(null);
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
               `/api/project/details/${activeProject}`,
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

   function handleProjectSelectOpen() {
      setProjectSelectOpen(true);
   }

   function handleProjectSelectClose() {
      setProjectSelectOpen(false);
   }

   function changeActiveProject(event) {
      setActiveProject(event.target.textContent);
      setProjectSelectOpen(false);
   }

   function changeAccordionState() {
      setAccordionExpanded(prev => !prev);
   }

   function goToCrumbLink(link) {
      history.push(link);
   }

   function currentProjects() {
      let thisOrgProjects = User.Projects.find(
         project => project.ParentOrganization === currentOrg
      );

      if (!thisOrgProjects)
         return <ListItem>You have no projects in this organization</ListItem>;

      let projectTitles = User.Projects.map(project => {
         return (
            project.ParentOrganization === currentOrg && (
               <ListItem
                  key={project._id}
                  onClick={changeActiveProject}
                  button={true}
                  selected={activeProject === project.ProjectName}
               >
                  <ListItemText
                     primary={project.ProjectName}
                     primaryTypographyProps={{
                        variant: "h6",
                        gutterBottom: true,
                     }}
                  />
               </ListItem>
            )
         );
      });
      return projectTitles;
   }

   return !isLoading ? (
      <div className="environment-panel-container">
         <Breadcrumbs
            className={classes.environmentCrumbs}
            separator={<ArrowRightAltIcon fontSize="large" color="secondary" />}
         >
            <Typography
               variant="h6"
               color="primary"
               component="div"
               gutterBottom={true}
               onClick={() => goToCrumbLink(`/organization/${currentOrg}`)}
            >
               {currentOrg}
            </Typography>
            <Typography
               variant="h6"
               color="primary"
               component="div"
               gutterBottom={true}
               onClick={() =>
                  goToCrumbLink(`/project/${currentOrg}/${activeProject}`)
               }
            >
               {activeProject}
            </Typography>
         </Breadcrumbs>
         <div className="environment-panel-main">
            <Tooltip title="Change project" placement="right" arrow>
               <IconButton
                  className={classes.projectSettingsBtn}
                  color="primary"
                  onClick={handleProjectSelectOpen}
               >
                  <AssignmentIcon fontSize="large" />
               </IconButton>
            </Tooltip>
            <Dialog onClose={handleProjectSelectClose} open={projectSelectOpen}>
               <DialogTitle id="simple-dialog-title">
                  Select a project to work on
               </DialogTitle>
               <List>{currentProjects()}</List>
            </Dialog>
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
