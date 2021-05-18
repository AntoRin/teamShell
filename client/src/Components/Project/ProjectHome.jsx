import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import SettingsIcon from "@material-ui/icons/Settings";
import ProjectSettingsModal from "./ProjectSettingsModal";
import LinearLoader from "../UtilityComponents/LinearLoader";
import "../../styles/project-home.css";

function ProjectHome({ match, User }) {
   const [isLoading, setIsLoading] = useState(true);
   const [isAuthorized, setIsAuthorized] = useState(false);
   const [parentOrg, setParentOrg] = useState({});
   const [Project, setProject] = useState({});
   const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

   function openSettingsModal() {
      setIsSettingsOpen(true);
   }

   if (isLoading) {
      return <LinearLoader />;
   } else {
      return isAuthorized ? (
         <div className="project-home-container">
            <div className="project-home-main-wrapper">
               <header className="project-home-header">
                  {parentOrg.OrganizationName}/{Project.ProjectName}
               </header>
               <div className="project-home-content">
                  <div className="project-members-section">
                     <h2 className="project-home-inner-title">Members</h2>
                     {Project.Members.map((member, index) => {
                        return <div key={index}>{member}</div>;
                     })}
                  </div>
                  <div className="project-details-section">
                     <div className="project-general-details">
                        <div>
                           <h2 className="project-home-inner-title">Creator</h2>
                        </div>
                        <div>{Project.Creator}</div>
                        <div>
                           <h2 className="project-home-inner-title">
                              Description
                           </h2>
                           <div>{Project.ProjectDescription}</div>
                        </div>
                     </div>
                     <div className="project-issue-details">
                        <h2 className="project-home-inner-title">Issues</h2>
                        {Project.Issues.length > 0
                           ? Project.Issues.map((issue, index) => {
                                return (
                                   <div key={index}>{issue.IssueTitle}</div>
                                );
                             })
                           : "No issues yet"}
                     </div>
                  </div>
               </div>
               <div
                  onClick={openSettingsModal}
                  className="project-settings-icon"
               >
                  <SettingsIcon fontSize="large" />
               </div>
               {isSettingsOpen && (
                  <ProjectSettingsModal
                     User={User}
                     Project={Project}
                     setIsSettingsOpen={setIsSettingsOpen}
                  />
               )}
            </div>
         </div>
      ) : (
         <h1>There was an error</h1>
      );
   }
}

export default ProjectHome;
