import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import SettingsSharpIcon from "@material-ui/icons/SettingsSharp";
// import EnvironmentPanel from "./EnvironmentPanel";
import WorkspaceSelection from "./WorkspaceSelection";

const useStyles = makeStyles(theme => ({
   configurationToggle: {
      cursor: "pointer",
      display: "flex",
      justifyContent: "flex-start",
      position: "fixed",
      top: "20%",
      left: "10px",
   },
   bottomDrawer: {
      "& .MuiDrawer-paperAnchorBottom": {
         background: "#E2DFD2",
      },
   },
   drawerList: {
      "&.MuiList-subheader": {
         fontSize: "1.2rem",
         fontFamily: `"Roboto", sans-serif`,
         fontWeight: "600",
      },
   },
}));

function UserEnvironment({ User }) {
   const classes = useStyles();

   const [currentOrg, setCurrentOrg] = useState(
      User.Organizations.length > 0
         ? User.Organizations[0].OrganizationName
         : null
   );

   const [configurationDrawer, setConfigurationDrawer] = useState(false);

   useEffect(() => {
      let preference = window.localStorage.getItem(
         "environment_organization_context"
      );
      if (preference) {
         let userOrg = User.Organizations.find(
            org => org.OrganizationName === preference
         );
         if (userOrg) setCurrentOrg(userOrg.OrganizationName);
      }
   }, [User.Organizations]);

   useEffect(() => {
      if (currentOrg !== null)
         window.localStorage.setItem(
            "environment_organization_context",
            currentOrg
         );
   }, [currentOrg]);

   function toggleConfigurationDrawer(open) {
      return event => {
         if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
         ) {
            return;
         }

         setConfigurationDrawer(open);
      };
   }

   function handleOrgChange(event) {
      setCurrentOrg(event.target.textContent);
      setConfigurationDrawer(false);
   }

   return (
      <div>
         <>
            <div className={classes.configurationToggle}>
               <Tooltip
                  title="Configure work environment"
                  placement="right"
                  arrow
               >
                  <IconButton
                     variant="text"
                     color="inherit"
                     onClick={toggleConfigurationDrawer(true)}
                  >
                     <SettingsSharpIcon fontSize="large" color="primary" />
                  </IconButton>
               </Tooltip>
            </div>
            <Drawer
               anchor="bottom"
               open={configurationDrawer}
               onClose={toggleConfigurationDrawer(false)}
               className={classes.bottomDrawer}
            >
               <List
                  className={classes.drawerList}
                  subheader="Choose an organization to work with"
               >
                  {User.Organizations.length > 0 ? (
                     User.Organizations.map(org => {
                        return (
                           <ListItem
                              key={org._id}
                              button
                              selected={org.OrganizationName === currentOrg}
                              onClick={handleOrgChange}
                              divider
                           >
                              <ListItemIcon>
                                 <AccountTreeIcon />
                              </ListItemIcon>
                              <ListItemText primary={org.OrganizationName} />
                           </ListItem>
                        );
                     })
                  ) : (
                     <ListItem>
                        <ListItemText primary="You are not part of any organization" />
                     </ListItem>
                  )}
               </List>
            </Drawer>
         </>
         {/* <EnvironmentPanel User={User} currentOrg={currentOrg} /> */}
         <WorkspaceSelection User={User} currentOrg={currentOrg} />
      </div>
   );
}

export default UserEnvironment;
