import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import AddToPhotosSharpIcon from "@material-ui/icons/AddToPhotosSharp";
import AddBoxIcon from "@material-ui/icons/AddBox";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import GeneralConfirmDialog from "../UtilityComponents/GeneralConfirmDialog";
import "../../styles/user-home.css";

const useStyles = makeStyles({
   homeContainer: {
      marginTop: navHeight => navHeight,
      height: navHeight => `calc(100vh - ${navHeight}px)`,
   },
   orgAccordion: {
      backgroundColor: "rgb(50, 46, 83)",
      "& h6": {
         color: "white",
         fontWeight: "500",
         fontSize: "1.3rem",
      },
      "& span": {
         color: "white",
         fontWeight: "500",
         fontSize: "1.1rem",
      },
      "& .MuiAccordionSummary-root": {
         backgroundColor: "#2a2b38",
         borderBottom: "1px solid #fafafa",
      },
   },
   orgListContainer: {
      width: "100%",
   },
   orgListElement: {
      "&.Mui-selected": {
         backgroundColor: "rgb(100, 70, 202)",
      },
      "&.MuiListItem-button:hover": {
         backgroundColor: "rgb(126, 114, 236)",
      },
   },
   projectListContainer: {
      marginTop: "25px",
      padding: "5px",
      backgroundColor: "rgb(50, 46, 83)",
      "&	.MuiListItem-divider": {
         borderBottom: "1px solid rgb(51, 0, 111)",
      },
      "& .MuiListItem-button:hover": {
         backgroundColor: "rgb(95, 77, 253)",
      },
      "&	.MuiListItem-selected": {
         borderBottom: "1px solid rgb(119, 59, 187)",
      },
   },
   button: {
      backgroundColor: "rgb(21, 0, 46)",
      color: "white",
      "&:hover": {
         backgroundColor: "black",
      },
   },
   projectTitle: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #fafafa",
      width: "100%",
   },
   icon: {
      color: "rgb(180, 170, 255)",
   },
});

function UserHome({ User, navHeight }) {
   const classes = useStyles(navHeight);

   const [activePanelOrg, setActivePanelOrg] = useState(
      User.Organizations.length > 0
         ? User.Organizations[0].OrganizationName
         : ""
   );
   const [confirmDialog, setConfirmDialog] = useState({
      isRequired: false,
      confirmationFor: null,
   });

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

   function requireConfirmation(orgName) {
      setConfirmDialog({
         isRequired: true,
         confirmationFor: orgName,
      });
   }

   function closeConfirmDialog() {
      setConfirmDialog({
         isRequired: false,
         confirmationFor: null,
      });
   }

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
         return [{ noProjectFallback: "No projects yet" }];

      let thisOrgProjects = User.Projects.find(
         project => project.ParentOrganization === activePanelOrg
      );

      if (!thisOrgProjects)
         return [{ noProjectFallback: "No project in this organization" }];

      let projectTitles = User.Projects.filter(
         project => project.ParentOrganization === activePanelOrg && project
      );
      return projectTitles;
   }

   return (
      <div className={classes.homeContainer}>
         <div className="home-main">
            <div className="user-details">
               <div className="details-section">
                  <Accordion className={classes.orgAccordion} square>
                     <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Organizations</Typography>
                     </AccordionSummary>
                     <AccordionDetails>
                        <List
                           className={classes.orgListContainer}
                           disablePadding
                           dense
                        >
                           {User.Organizations.length > 0 ? (
                              User.Organizations.map(org => {
                                 return (
                                    <ListItem
                                       key={org._id}
                                       className={classes.orgListElement}
                                       button
                                       divider
                                       alignItems="flex-start"
                                       selected={
                                          activePanelOrg ===
                                          org.OrganizationName
                                       }
                                       onClick={() =>
                                          activePanelOrg !==
                                             org.OrganizationName &&
                                          requireConfirmation(
                                             org.OrganizationName
                                          )
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
                           <ListItem disableGutters>
                              <ListItemText
                                 primary="Create"
                                 primaryTypographyProps={{
                                    variant: "caption",
                                 }}
                                 secondary="New Organization"
                                 secondaryTypographyProps={{
                                    color: "secondary",
                                    variant: "caption",
                                 }}
                              />
                              <ListItemIcon onClick={createNewOrganization}>
                                 <IconButton className={classes.icon}>
                                    <AddBoxIcon fontSize="large" />
                                 </IconButton>
                              </ListItemIcon>
                           </ListItem>
                        </List>
                     </AccordionDetails>
                  </Accordion>
               </div>
               <div className="details-section">
                  <List
                     className={classes.projectListContainer}
                     subheader={
                        <div className={classes.projectTitle}>
                           <Typography variant="h6">Projects</Typography>
                           <IconButton
                              className={classes.icon}
                              onClick={createNewProject}
                           >
                              <AddToPhotosSharpIcon fontSize="large" />
                           </IconButton>
                        </div>
                     }
                  >
                     {currentProjects().map((project, index) => (
                        <ListItem
                           key={project._id || index}
                           button={project._id && true}
                           divider
                           onClick={() => goToProject(project.ProjectName)}
                        >
                           <ListItemText
                              primary={
                                 project.ProjectName ||
                                 project.noProjectFallback
                              }
                           />
                        </ListItem>
                     ))}
                  </List>
               </div>
            </div>
            <div className="home-workspace">
               <h1 style={{ color: "gray" }}>No work progress to show😴</h1>
            </div>
         </div>
         <GeneralConfirmDialog
            confirmationRequired={confirmDialog.isRequired}
            handleConfirmationSuccess={() => {
               changePanelOrg(confirmDialog.confirmationFor);
               setConfirmDialog({ isRequired: false, confirmationFor: null });
            }}
            handleConfirmationFailure={closeConfirmDialog}
            title="Do you want to switch organizations?"
            body=""
         />
      </div>
   );
}

export default UserHome;
