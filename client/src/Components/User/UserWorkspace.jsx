import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import AppsIcon from "@material-ui/icons/Apps";
import Tooltip from "@material-ui/core/Tooltip";
import { Button, Container, ButtonGroup } from "@material-ui/core";
import FolderIcon from "@material-ui/icons/Folder";
import CodeIcon from "@material-ui/icons/Code";
import WorkspaceIssueTab from "./WorkspaceIssueTab";
import WorkspaceDriveTab from "./WorkspaceDriveTab";
import WorkspaceFileTab from "./WorkspaceFileTab";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
import { GlobalActionStatus } from "../App";
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
   projectSettingsBtn: {
      position: "fixed",
      top: "15%",
      left: "10px",
   },
   workspaceNav: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
}));

function UserWorkspace({ location, User }) {
   const classes = useStyles();

   const [parentOrg, setParentOrg] = useState(null);
   const [activeProject, setActiveProject] = useState(null);
   const [projectDetails, setProjectDetails] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [tab, setTab] = useState("issues");

   const history = useHistory();

   const socket = useContext(SocketInstance);
   const setActionStatus = useContext(GlobalActionStatus);

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

               if (project.ParentOrganization !== parentOrg)
                  throw new Error("Project not found");

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
   }, [activeProject, parentOrg, socket, history]);

   function goToEnvironment() {
      history.push("/user/environment");
   }

   function changeWorkspaceTab(tabName) {
      setTab(tabName.toLowerCase());
   }

   return (
      <div className="environment-panel-container">
         <Tooltip title="Change project" placement="right" arrow>
            <IconButton
               className={classes.projectSettingsBtn}
               color="primary"
               onClick={goToEnvironment}
            >
               <AppsIcon fontSize="large" />
            </IconButton>
         </Tooltip>
         <Container className={classes.workspaceNav}>
            <ButtonGroup>
               <Button
                  color="primary"
                  endIcon={<CodeIcon />}
                  onClick={() => changeWorkspaceTab("issues")}
               >
                  Issues
               </Button>
               <Button
                  color="primary"
                  endIcon={<FolderIcon />}
                  onClick={() => changeWorkspaceTab("yourdrive")}
               >
                  Your Drive
               </Button>
               <Button
                  color="primary"
                  endIcon={<FolderIcon />}
                  onClick={() => changeWorkspaceTab("projectfiles")}
               >
                  Project Files
               </Button>
            </ButtonGroup>
         </Container>
         <WorkspaceIssueTab
            User={User}
            activeProject={activeProject}
            projectDetails={projectDetails}
            setActionStatus={setActionStatus}
            isLoading={isLoading}
            tab={tab}
         />
         <WorkspaceDriveTab
            User={User}
            activeProject={activeProject}
            tab={tab}
         />
         <WorkspaceFileTab
            User={User}
            activeProject={activeProject}
            tab={tab}
         />
      </div>
   );
}

export default UserWorkspace;
