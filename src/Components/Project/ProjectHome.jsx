import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import SettingsIcon from "@material-ui/icons/Settings";
import GlobalNav from "../GlobalNav";
import ProjectSettingsModal from "./ProjectSettingsModal";
import "../../styles/project-home.css";

function ProjectHome({ match, User }) {
   const [isLoading, setIsLoading] = useState(true);
   const [isAuthorized, setIsAuthorized] = useState(false);
   const [parentOrg, setParentOrg] = useState({});
   const [Project, setProject] = useState({});
   const [settings, setSettings] = useState(false);

   const history = useHistory();

   useEffect(() => {
      let abortFetch = new AbortController();

      async function getProjectDetails() {
         let orgRequest = await fetch(
            `http://localhost:5000/organization/details/${match.params.OrganizationName}`,
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
            `http://localhost:5000/project/details/${match.params.ProjectName}`,
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
      }

      getProjectDetails();

      return () => abortFetch.abort();
   }, [match, history]);

   function openSettingsModal() {
      setSettings(true);
   }

   if (isLoading) {
      return <h1>Loading...</h1>;
   } else {
      return isAuthorized ? (
         <div className="project-home-container">
            <GlobalNav
               ProfileImage={User.ProfileImage}
               UniqueUsername={User.UniqueUsername}
            />
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
               {settings && (
                  <ProjectSettingsModal
                     Project={Project}
                     setSettings={setSettings}
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
