import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import AddBoxIcon from "@material-ui/icons/AddBox";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import "../../styles/user-home.css";
import { Button } from "@material-ui/core";

const useStyles = makeStyles({
   homeContainer: {
      marginTop: navHeight => navHeight,
   },
   listContainer: {
      width: "100%",
      backgroundColor: "rgb(67, 64, 100)",
   },
   listElement: {
      "&.Mui-selected": {
         backgroundColor: "rgb(111, 59, 255)",
      },
      "&.MuiListItem-button:hover": {
         backgroundColor: "rgb(126, 114, 236)",
      },
   },
   accordion: {
      backgroundColor: "rgb(67, 64, 100)",
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
      let preference = window.localStorage.getItem("organization_context");
      if (preference) {
         let userOrg = User.Organizations.find(
            org => org.OrganizationName === preference
         );
         if (userOrg) setActivePanelOrg(userOrg.OrganizationName);
      }
   }, [User.Organizations]);

   useEffect(() => {
      window.localStorage.setItem("organization_context", activePanelOrg);
   }, [activePanelOrg]);

   function changePanelOrg(orgName) {
      setActivePanelOrg(orgName);
   }

   function goToOrg(orgName) {
      history.push(`/organization/${orgName}`);
   }

   function goToProject(projectName) {
      history.push(`/project/${activePanelOrg}/${projectName}`);
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

      let projectTitles = User.Projects.map(project => {
         return (
            project.ParentOrganization === activePanelOrg && (
               <div
                  key={project._id}
                  className="member-list-item"
                  onClick={() => goToProject(project.ProjectName)}
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
                  <Accordion className={classes.accordion} square>
                     <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Organizations</Typography>
                     </AccordionSummary>
                     <AccordionDetails>
                        <List className={classes.listContainer}>
                           {User.Organizations.length > 0 ? (
                              User.Organizations.map(org => {
                                 return (
                                    <ListItem
                                       key={org._id}
                                       className={classes.listElement}
                                       button
                                       divider
                                       selected={
                                          activePanelOrg ===
                                          org.OrganizationName
                                       }
                                       onClick={() =>
                                          changePanelOrg(org.OrganizationName)
                                       }
                                       onDoubleClick={() =>
                                          goToOrg(org.OrganizationName)
                                       }
                                    >
                                       <ListItemText
                                          primary={org.OrganizationName}
                                       />
                                    </ListItem>
                                 );
                              })
                           ) : (
                              <div className="member-list-item">
                                 You are not part of any organization
                              </div>
                           )}
                           <Button
                              color="primary"
                              variant="contained"
                              fullWidth={true}
                              size="large"
                              onClick={createNewOrganization}
                              endIcon={<AddBoxIcon />}
                           >
                              New Organization
                           </Button>
                        </List>
                     </AccordionDetails>
                  </Accordion>
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
