import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles, Tooltip } from "@material-ui/core";
import Fab from "@material-ui/core/Fab";
import CreateIcon from "@material-ui/icons/Create";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
import IssueEditor from "./IssueEditor";
import IssueCard from "./IssueCard";
import LinearLoader from "../UtilityComponents/LinearLoader";
import ContentModal from "../UtilityComponents/ContentModal";

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
   newIssueToggle: {
      position: "fixed",
      bottom: "5%",
      right: "5%",
   },
}));

function WorkspaceIssueTab({ tab, User, activeProject, setActionStatus }) {
   const classes = useStyles();

   const [projectDetails, setProjectDetails] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);

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

   function openEditorModal() {
      setIsEditorModalOpen(true);
   }

   function closeEditorModal() {
      setIsEditorModalOpen(false);
   }

   return tab === "issues" ? (
      <div className="environment-panel-main">
         <div className="environment-workspace">
            {activeProject ? (
               <Tooltip
                  className={classes.newIssueToggle}
                  title="Create a new issue"
                  placement="left"
               >
                  <Fab color="primary" onClick={openEditorModal}>
                     <CreateIcon fontSize="large" />
                  </Fab>
               </Tooltip>
            ) : (
               <h1>Create a project to get started</h1>
            )}
            <ContentModal
               isModalOpen={isEditorModalOpen}
               handleModalClose={closeEditorModal}
            >
               <IssueEditor
                  activeProject={activeProject}
                  User={User}
                  done={closeEditorModal}
               />
            </ContentModal>
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
