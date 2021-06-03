import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import AppsIcon from "@material-ui/icons/Apps";
import Tooltip from "@material-ui/core/Tooltip";
import { Button, Container, ButtonGroup } from "@material-ui/core";
import FolderIcon from "@material-ui/icons/Folder";
import SecurityIcon from "@material-ui/icons/Security";
import CodeIcon from "@material-ui/icons/Code";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import WorkspaceIssueTab from "./WorkspaceIssueTab";
import WorkspaceDriveTab from "./WorkspaceDriveTab";
import WorkspaceFileTab from "./WorkspaceFileTab";
import WorkspaceChatTab from "./WorkspaceChatTab";
import { GlobalActionStatus } from "../App";
import parseQueryStrings from "../../utils/parseQueryStrings";
import "../../styles/environment-panel.css";
import LinearLoader from "../UtilityComponents/LinearLoader";

const useStyles = makeStyles(theme => ({
   "environment-panel-container": {
      width: "100%",
      minHeight: navHeight => `calc(100vh - ${navHeight}px)`,
      overflowX: "hidden",
      overflowY: "scroll",
   },
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
   projectBackBtn: {
      position: "absolute",
      top: "15%",
      left: "10px",
   },
   workspaceNav: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
}));

function UserWorkspace({ location, User, navHeight }) {
   const classes = useStyles(navHeight);

   const [parentOrg, setParentOrg] = useState(null);
   const [activeProject, setActiveProject] = useState(null);
   const [tab, setTab] = useState("issues");
   const [projectMembers, setProjectMembers] = useState(null);
   const [isLoading, setIsLoading] = useState(false);

   const history = useHistory();

   const setActionStatus = useContext(GlobalActionStatus);

   useEffect(() => {
      async function verifyBasicDetails() {
         setIsLoading(true);
         let queryString = location.search;
         try {
            if (!queryString) throw new Error("Invalid query string");

            let queries = parseQueryStrings(queryString);
            if (!queries.organization || !queries.project)
               throw new Error("Invalid query string");

            let responseStream = await fetch(
               `/api/project/verification-data/${queries.project}`
            );
            let response = await responseStream.json();

            if (response.status === "error") throw response.error;

            let projectData = response.data;

            if (projectData.ParentOrganization !== queries.organization)
               throw new Error("Invalid query string");

            setParentOrg(queries.organization);
            setActiveProject(queries.project);
            queries.tab && setTab(queries.tab);
            setProjectMembers(projectData.Members);
            setIsLoading(false);
         } catch (error) {
            history.push("/user/environment");
         }
      }

      verifyBasicDetails();
   }, [history, location.search]);

   function goToEnvironment() {
      history.push("/user/environment");
   }

   function changeWorkspaceTab(tabName) {
      if (!parentOrg || !activeProject) return;
      history.push(
         `/user/workspace?organization=${parentOrg}&project=${activeProject}&tab=${tabName.toLowerCase()}`
      );
   }

   function WorkspaceTab() {
      switch (tab) {
         case "issues":
            return (
               <WorkspaceIssueTab
                  User={User}
                  activeProject={activeProject}
                  setActionStatus={setActionStatus}
               />
            );
         case "your-drive":
            return (
               <WorkspaceDriveTab User={User} activeProject={activeProject} />
            );
         case "project-files":
            return (
               <WorkspaceFileTab User={User} activeProject={activeProject} />
            );
         case "project-chat":
            return (
               <WorkspaceChatTab
                  User={User}
                  activeProject={activeProject}
                  projectMembers={projectMembers}
               />
            );
         default:
            return (
               <WorkspaceIssueTab
                  User={User}
                  activeProject={activeProject}
                  setActionStatus={setActionStatus}
               />
            );
      }
   }

   return (
      <div className={classes["environment-panel-container"]}>
         <Tooltip title="Change project" placement="right" arrow>
            <IconButton
               className={classes.projectBackBtn}
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
                  endIcon={<SecurityIcon />}
                  onClick={() => changeWorkspaceTab("your-drive")}
               >
                  Your Drive
               </Button>
               <Button
                  color="primary"
                  endIcon={<FolderIcon />}
                  onClick={() => changeWorkspaceTab("project-files")}
               >
                  Project Files
               </Button>
               <Button
                  color="primary"
                  endIcon={<GroupAddIcon />}
                  onClick={() => changeWorkspaceTab("project-chat")}
               >
                  Project Chat
               </Button>
            </ButtonGroup>
         </Container>
         {isLoading ? <LinearLoader /> : <WorkspaceTab />}
      </div>
   );
}

export default UserWorkspace;
