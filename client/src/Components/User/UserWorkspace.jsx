import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import AppsIcon from "@material-ui/icons/Apps";
import Tooltip from "@material-ui/core/Tooltip";
import Container from "@material-ui/core/Container";
import FolderIcon from "@material-ui/icons/Folder";
import SecurityIcon from "@material-ui/icons/Security";
import CodeIcon from "@material-ui/icons/Code";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import VideocamIcon from "@material-ui/icons/Videocam";
import WorkspaceIssueTab from "./WorkspaceIssueTab";
import WorkspaceDriveTab from "./WorkspaceDriveTab";
import WorkspaceFileTab from "./WorkspaceFileTab";
import WorkspaceChatTab from "./WorkspaceChatTab";
import WorkspaceMeetTab from "./WorkspaceMeetTab";
import { GlobalActionStatus } from "../App";
import parseQueryStrings from "../../utils/parseQueryStrings";
import "../../styles/environment-panel.css";
import LinearLoader from "../UtilityComponents/LinearLoader";

const useStyles = makeStyles(theme => ({
   "environment-panel-container": {
      width: "100%",
      minHeight: navHeight => `calc(100vh - ${navHeight}px)`,
      marginTop: navHeight => navHeight,
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
   workspaceNav: {
      position: "fixed",
      top: navHeight => navHeight,
      left: 0,
      width: "50px",
      height: navHeight => `calc(100vh - ${navHeight}px)`,
      background: "rgb(22, 22, 35)",
      boxShadow: "2px 0 2px #111",
   },
   navAlign: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
   },
   icons: {
      color: "rgb(108, 98, 190)",
   },
   activeIcon: {
      color: "lightblue",
      borderBottom: "1px solid white",
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
      let abortFetch = new AbortController();

      async function verifyBasicDetails() {
         setIsLoading(true);
         let queryString = location.search;
         try {
            if (!queryString) throw new Error("Invalid query string");

            let queries = parseQueryStrings(queryString);
            if (!queries.organization || !queries.project)
               throw new Error("Invalid query string");

            let responseStream = await fetch(
               `/api/project/verification-data/${queries.project}`,
               { signal: abortFetch.signal }
            );

            if (abortFetch.signal.aborted) return;

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

      return () => abortFetch.abort();
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

   return (
      <div className={classes["environment-panel-container"]}>
         <Container className={classes.workspaceNav}>
            <div className={classes.navAlign}>
               <Tooltip placement="right" title="Issues">
                  <IconButton onClick={() => changeWorkspaceTab("issues")}>
                     <CodeIcon
                        fontSize="large"
                        className={`${classes.icons} ${
                           tab === "issues" && classes.activeIcon
                        }`}
                     />
                  </IconButton>
               </Tooltip>
               <Tooltip placement="right" title="Your Drive">
                  <IconButton onClick={() => changeWorkspaceTab("your-drive")}>
                     <SecurityIcon
                        fontSize="large"
                        className={`${classes.icons} ${
                           tab === "your-drive" && classes.activeIcon
                        }`}
                     />
                  </IconButton>
               </Tooltip>
               <Tooltip placement="right" title="Project Files">
                  <IconButton
                     onClick={() => changeWorkspaceTab("project-files")}
                  >
                     <FolderIcon
                        fontSize="large"
                        className={`${classes.icons} ${
                           tab === "project-files" && classes.activeIcon
                        }`}
                     />
                  </IconButton>
               </Tooltip>
               <Tooltip placement="right" title="Project Chat">
                  <IconButton
                     onClick={() => changeWorkspaceTab("project-chat")}
                  >
                     <GroupAddIcon
                        fontSize="large"
                        className={`${classes.icons} ${
                           tab === "project-chat" && classes.activeIcon
                        }`}
                     />
                  </IconButton>
               </Tooltip>
               <Tooltip placement="right" title="Meet">
                  <IconButton onClick={() => changeWorkspaceTab("meet")}>
                     <VideocamIcon
                        fontSize="large"
                        className={`${classes.icons} ${
                           tab === "meet" && classes.activeIcon
                        }`}
                     />
                  </IconButton>
               </Tooltip>
               <Tooltip title="Change project" placement="right" arrow>
                  <IconButton onClick={goToEnvironment}>
                     <AppsIcon fontSize="large" className={classes.icons} />
                  </IconButton>
               </Tooltip>
            </div>
         </Container>
         {isLoading ? (
            <LinearLoader />
         ) : (
            <>
               <WorkspaceIssueTab
                  tab={tab}
                  User={User}
                  activeProject={activeProject}
                  setActionStatus={setActionStatus}
               />
               <WorkspaceDriveTab
                  tab={tab}
                  User={User}
                  activeProject={activeProject}
               />
               <WorkspaceFileTab
                  tab={tab}
                  User={User}
                  activeProject={activeProject}
               />
               <WorkspaceChatTab
                  tab={tab}
                  User={User}
                  activeProject={activeProject}
                  projectMembers={projectMembers}
                  navHeight={navHeight}
               />
               <WorkspaceMeetTab tab={tab} activeProject={activeProject} />
            </>
         )}
      </div>
   );
}

export default UserWorkspace;
