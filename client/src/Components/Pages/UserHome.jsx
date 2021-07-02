import { useState, useEffect, useRef } from "react";
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
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import HomeFeedTab from "../User/HomeFeedTab";
import HomeExploreTab from "../User/HomeExploreTab";
import GeneralConfirmDialog from "../UtilityComponents/GeneralConfirmDialog";
import "../../styles/user-home.css";

const useStyles = makeStyles({
   homeContainer: {
      marginTop: navHeight => navHeight,
      height: navHeight => `calc(100vh - ${navHeight}px)`,
   },
   orgAccordion: {
      backgroundColor: "rgb(50, 46, 83)",
      "& .MuiAccordionDetails-root": {
         padding: "5px 0",
      },
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
      "&.MuiList-root": {
         width: "100%",
      },
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
   panelTabContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      margin: "30px 0",
      width: "100%",
      "& .MuiToggleButton-root": {
         width: "100%",
         backgroundColor: "rgba(0, 0, 0, 0.25)",
      },
      "& .MuiToggleButton-root:hover": {
         width: "100%",
         backgroundColor: "rgba(0, 0, 0, 0.4)",
      },
      "& .Mui-selected": {
         backgroundColor: "rgba(0, 0, 0, 0.4)",
      },
      "& h6": {
         color: "#fff",
      },
   },
});

function UserHome({ User, navHeight }) {
   const [activePanelOrg, setActivePanelOrg] = useState(
      User.Organizations.length > 0
         ? User.Organizations[0].OrganizationName
         : ""
   );
   const [confirmDialog, setConfirmDialog] = useState({
      isRequired: false,
      confirmationFor: null,
   });
   const [panelTab, setPanelTab] = useState("feed");
   const [sidePanelWidth, setSidePanelWidth] = useState(250);

   const sidePanelRef = useRef();

   const history = useHistory();

   const classes = useStyles(navHeight);

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

   useEffect(() => {
      setSidePanelWidth(sidePanelRef.current.offsetWidth);
   }, []);

   function handlePanelTabChange(event, newTab) {
      if (newTab !== null) {
         setPanelTab(newTab);
      }
   }

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

      const thisOrgProjects = User.Projects.find(
         project => project.ParentOrganization === activePanelOrg
      );

      if (!thisOrgProjects)
         return [{ noProjectFallback: "No project in this organization" }];

      const projectTitles = User.Projects.filter(
         project => project.ParentOrganization === activePanelOrg && project
      );
      return projectTitles;
   }

   return (
      <div className={classes.homeContainer}>
         <div className="home-main">
            <div ref={sidePanelRef} className="user-details">
               <div className="details-section">
                  <Accordion className={classes.orgAccordion} square>
                     <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Organizations</Typography>
                     </AccordionSummary>
                     <AccordionDetails>
                        <List className={classes.orgListContainer}>
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
                              <ListItem
                                 className={classes.orgListElement}
                                 divider
                              >
                                 <ListItemText primary="You are not part of any organization" />
                              </ListItem>
                           )}
                           <ListItem>
                              <ListItemText
                                 primary="Create"
                                 primaryTypographyProps={{
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
                           onClick={() =>
                              project._id && goToProject(project.ProjectName)
                           }
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
               <div>
                  <ToggleButtonGroup
                     className={classes.panelTabContainer}
                     exclusive
                     value={panelTab}
                     onChange={handlePanelTabChange}
                  >
                     <ToggleButton value="feed">
                        <Typography variant="h6" color="initial">
                           Feed
                        </Typography>
                     </ToggleButton>
                     <ToggleButton value="explore">
                        <Typography variant="h6" color="initial">
                           Explore
                        </Typography>
                     </ToggleButton>
                  </ToggleButtonGroup>
               </div>
            </div>
            <div className="home-tab-result">
               <HomeFeedTab tab={panelTab} />
               <HomeExploreTab tab={panelTab} sidePanelWidth={sidePanelWidth} />
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
