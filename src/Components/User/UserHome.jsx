import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import AddBoxIcon from "@material-ui/icons/AddBox";
import GlobalNav from "../GlobalNav";
import "../../styles/user-home.css";

function UserHome({ User }) {
   const [activePanelOrg, setActivePanelOrg] = useState(
      User.Organizations[0].OrganizationName || ""
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
      history.push("/create/project");
   }

   return (
      <div className="home-container">
         <GlobalNav
            ProfileImage={User.ProfileImage}
            UniqueUsername={User.UniqueUsername}
         />
         <div className="home-main">
            <div className="user-details">
               <div className="details-section">
                  <h3 className="member-list-header">Organizations</h3>
                  {User.Organizations.map((org, index) => {
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
                  })}
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
                  {User.Projects.length > 0 ? (
                     User.Projects.map((project, index) => {
                        if (project.ParentOrganization === activePanelOrg)
                           return (
                              <div
                                 onClick={goToProject}
                                 className="member-list-item"
                                 key={index}
                              >
                                 {project.ProjectName}
                              </div>
                           );
                        else return "";
                     })
                  ) : (
                     <div className="member-list-item">No projects</div>
                  )}
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
            <div className="side-info">
               <div className="aside-help-links">
                  <Link className="stripped-down-link" to="/docs">
                     Docs
                  </Link>
               </div>
               <div className="aside-help-links">
                  <Link className="stripped-down-link" to="/api">
                     API
                  </Link>
               </div>
               <div className="aside-help-links">
                  <Link className="stripped-down-link" to="/help">
                     Help
                  </Link>
               </div>
               <div className="aside-help-links">
                  <Link className="stripped-down-link" to="/explore">
                     Explore
                  </Link>
               </div>
            </div>
         </div>
      </div>
   );
}

export default UserHome;
