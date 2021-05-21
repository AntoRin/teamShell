import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import SettingsIcon from "@material-ui/icons/Settings";
import IconButton from "@material-ui/core/IconButton";
import ProjectTabPanel from "./ProjectTabPanel";
import ProjectSettingsModal from "./ProjectSettingsModal";
import LinearLoader from "../UtilityComponents/LinearLoader";
import "../../styles/project-home.css";

const useStyles = makeStyles(theme => ({
   root: props => ({
      flexGrow: 1,
      backgroundColor: "rgb(18, 18, 23)",
      display: "flex",
      minHeight: `calc(100vh - ${props.navHeight}px)`,
      overflowY: "scroll",
      overflowX: "hidden",
      fontFamily: `"Roboto", sans-serif`,
   }),
   tabs: {
      borderRight: `1px solid ${theme.palette.divider}`,
      backgroundColor: "#111",
   },
   tab: {
      margin: "15px",
   },
   settings: {
      position: "fixed",
      bottom: "5px",
      left: "5px",
   },
}));

function ProjectHome({ match, User, navHeight }) {
   const classes = useStyles({ navHeight });

   const [isLoading, setIsLoading] = useState(true);
   const [isAuthorized, setIsAuthorized] = useState(false);
   const [parentOrg, setParentOrg] = useState({});
   const [Project, setProject] = useState({});
   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
   const [tabName, setTabName] = useState("General Details");

   const history = useHistory();

   useEffect(() => {
      let abortFetch = new AbortController();

      async function getProjectDetails() {
         try {
            let orgRequest = await fetch(
               `/organization/details/${match.params.OrganizationName}`,
               {
                  credentials: "include",
                  signal: abortFetch.signal,
               }
            );

            if (abortFetch.signal.aborted) return;

            let orgResponse = await orgRequest.json();

            if (orgResponse.status === "ok") {
               setParentOrg(orgResponse.Organization);
            } else {
               setParentOrg({});
               setIsAuthorized(false);
               history.push("/user/home");
               return;
            }

            let projectRequest = await fetch(
               `/project/details/${match.params.ProjectName}`,
               {
                  credentials: "include",
                  signal: abortFetch.signal,
               }
            );

            if (abortFetch.signal.aborted) return;

            let projectResponse = await projectRequest.json();

            if (projectResponse.status === "ok") {
               setProject(projectResponse.Project);
               setIsAuthorized(true);
               setIsLoading(false);
            } else {
               setParentOrg({});
               setProject({});
               setIsAuthorized(false);
               history.push("/user/home");
               return;
            }
         } catch (error) {
            console.error("The request was aborted");
         }
      }

      getProjectDetails();

      return () => abortFetch.abort();
   }, [match, history]);

   function handleTabChange(event) {
      setTabName(event.target.textContent);
   }

   function openSettingsModal() {
      setIsSettingsOpen(true);
   }

   if (isLoading) {
      return <LinearLoader />;
   } else {
      return isAuthorized ? (
         <div className={classes.root}>
            <Tabs
               orientation="vertical"
               indicatorColor="primary"
               value={tabName}
               onChange={handleTabChange}
               className={classes.tabs}
            >
               <Tab
                  className={classes.tab}
                  label="General Details"
                  value="General Details"
               />
               <Tab className={classes.tab} label="Issues" value="Issues" />
               <Tab className={classes.tab} label="Members" value="Members" />
            </Tabs>
            <ProjectTabPanel tabName={tabName} Project={Project} />
            {Project.Creator === User.UniqueUsername && (
               <IconButton
                  className={classes.settings}
                  onClick={openSettingsModal}
               >
                  <SettingsIcon color="primary" />
               </IconButton>
            )}
            {isSettingsOpen && (
               <ProjectSettingsModal
                  User={User}
                  Project={Project}
                  setIsSettingsOpen={setIsSettingsOpen}
               />
            )}
         </div>
      ) : (
         <h1>There was an error</h1>
      );
   }
}

export default ProjectHome;
