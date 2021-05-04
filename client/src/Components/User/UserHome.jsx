import { useState } from "react";
import { useHistory } from "react-router-dom";
import AddBoxIcon from "@material-ui/icons/AddBox";
import "../../styles/user-home.css";

function UserHome({ User }) {
   const [activePanelOrg, setActivePanelOrg] = useState(
      User.Organizations.length > 0
         ? User.Organizations[0].OrganizationName
         : ""
   );

   const history = useHistory();

   function changePanelOrg(event) {
      setActivePanelOrg(event.target.innerHTML);
   }

   function goToOrg(event) {
      history.push(`/organization/${event.target.innerHTML}`);
   }

   function goToProject(event) {
      history.push(`/project/${activePanelOrg}/${event.target.innerHTML}`);
   }

   function createNewOrganization() {
      history.push("/create/organization");
   }

   function createNewProject() {
      history.push(`/create/project?Organization=${activePanelOrg}`);
   }

   function currentProjects() {
      if (User.Projects.length < 1)
         return <div className="member-list-item">No projects yet</div>;

      let thisOrgProjects = User.Projects.find(
         project => project.ParentOrganization === activePanelOrg
      );

      if (!thisOrgProjects)
         return (
            <div className="member-list-item">
               No project in this organization
            </div>
         );

      let projectTitles = User.Projects.map((project, index) => {
         return (
            project.ParentOrganization === activePanelOrg && (
               <div
                  key={index}
                  className="member-list-item"
                  onClick={goToProject}
               >
                  {project.ProjectName}
               </div>
            )
         );
      });
      return projectTitles;
   }

   return (
      <div className="home-container">
         <div className="home-main">
            <div className="user-details">
               <div className="details-section">
                  <h3 className="member-list-header">Organizations</h3>
                  {User.Organizations.length > 0 ? (
                     User.Organizations.map((org, index) => {
                        return (
                           <div
                              onClick={changePanelOrg}
                              onDoubleClick={goToOrg}
                              className={`member-list-item ${
                                 activePanelOrg === org.OrganizationName
                                    ? "active-member"
                                    : ""
                              }`}
                              key={index}
                           >
                              {org.OrganizationName}
                           </div>
                        );
                     })
                  ) : (
                     <div className="member-list-item">
                        You are not part of any organization
                     </div>
                  )}
                  <div className="create-org-btn">
                     <button
                        onClick={createNewOrganization}
                        className="create-btn"
                     >
                        <span>New Organization</span>
                        <AddBoxIcon />
                     </button>
                  </div>
               </div>
               <div className="details-section">
                  <h3 className="member-list-header">Projects</h3>
                  {currentProjects()}
                  <div className="create-project-btn">
                     <button onClick={createNewProject} className="create-btn">
                        <span>New Project</span>
                        <AddBoxIcon />
                     </button>
                  </div>
               </div>
            </div>
            <div className="home-workspace">
               <h1 style={{ color: "gray" }}>No work progress to show😴</h1>
            </div>
         </div>
      </div>
   );
}

export default UserHome;
