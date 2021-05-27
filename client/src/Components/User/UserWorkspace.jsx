import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import AppsIcon from "@material-ui/icons/Apps";
import Tooltip from "@material-ui/core/Tooltip";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
import IssueEditor from "./IssueEditor";
import IssueCard from "./IssueCard";
import StatusBar from "../UtilityComponents/StatusBar";
import LinearLoader from "../UtilityComponents/LinearLoader";
import parseQueryStrings from "../../utils/parseQueryStrings";
import "../../styles/environment-panel.css";

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
      top: "15%",
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

function UserWorkspace({ location, User }) {
   const classes = useStyles();

   const [parentOrg, setParentOrg] = useState(null);
   const [activeProject, setActiveProject] = useState(null);
   const [projectDetails, setProjectDetails] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [actionStatus, setActionStatus] = useState({
      type: "success",
      info: null,
   });
   const [accordionExpanded, setAccordionExpanded] = useState(false);

   const history = useHistory();

   const socket = useContext(SocketInstance);

   useEffect(() => {
      let queryString = location.search;
      try {
         if (!queryString) throw new Error("Invalid query string");

         let queries = parseQueryStrings(queryString);
         if (!queries.organization || !queries.project)
            throw new Error("Invalid query string");

         setParentOrg(queries.organization);
         setActiveProject(queries.project);
      } catch (error) {
         history.push("/user/environment");
      }
   }, [history, location.search]);

   useEffect(() => {
      if (!activeProject) return;

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
            }
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
   }, [activeProject, socket, history]);

   function changeAccordionState() {
      setAccordionExpanded(prev => !prev);
   }

   function goToEnvironment() {
      history.push("/user/environment");
   }

   return (
      <div className="environment-panel-container">
         <div className="environment-panel-main">
            <Tooltip title="Change project" placement="right" arrow>
               <IconButton
                  className={classes.projectSettingsBtn}
                  color="primary"
                  onClick={goToEnvironment}
               >
                  <AppsIcon fontSize="large" />
               </IconButton>
            </Tooltip>
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
         {actionStatus.info && (
            <StatusBar
               actionStatus={actionStatus}
               setActionStatus={setActionStatus}
            />
         )}
      </div>
   );
}

export default UserWorkspace;
