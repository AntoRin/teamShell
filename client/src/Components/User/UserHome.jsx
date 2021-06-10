import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import AddBoxIcon from "@material-ui/icons/AddBox";
import "../../styles/user-home.css";
import { Button } from "@material-ui/core";

const useStyles = makeStyles({
   homeContainer: {
      marginTop: navHeight => navHeight,
   },
});

function UserHome({ User, navHeight }) {
   const classes = useStyles(navHeight);

   const [activePanelOrg, setActivePanelOrg] = useState(
      User.Organizations.length > 0
         ? User.Organizations[0].OrganizationName
         : ""
   );

   const history = useHistory();

   useEffect(() => {
      let preference = window.localStorage.getItem("home_organization_context");
      if (preference) {
         let userOrg = User.Organizations.find(
            org => org.OrganizationName === preference
         );
         if (userOrg) setActivePanelOrg(userOrg.OrganizationName);
      }
   }, [User.Organizations]);

   useEffect(() => {
      window.localStorage.setItem("home_organization_context", activePanelOrg);
   }, [activePanelOrg]);

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
      <div className={classes.homeContainer}>
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
                     <Button
                        color="primary"
                        variant="outlined"
                        fullWidth={true}
                        onClick={createNewOrganization}
                        endIcon={<AddBoxIcon />}
                     >
                        New Organization
                     </Button>
                  </div>
               </div>
               <div className="details-section">
                  <h3 className="member-list-header">Projects</h3>
                  {currentProjects()}
                  <div className="create-project-btn">
                     <Button
                        color="primary"
                        variant="outlined"
                        fullWidth={true}
                        onClick={createNewProject}
                        endIcon={<AddBoxIcon />}
                     >
                        New Project
                     </Button>
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
