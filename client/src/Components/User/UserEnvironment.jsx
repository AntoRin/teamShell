import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import SettingsSharpIcon from "@material-ui/icons/SettingsSharp";
import EnvironmentPanel from "./EnvironmentPanel";

const useStyles = makeStyles(theme => ({
   configurationToggle: {
      cursor: "pointer",
      display: "flex",
      justifyContent: "flex-start",
      margin: "0 10px",
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
      () =>
         window.localStorage.getItem("environment_organization_context") ||
         (User.Organizations.length > 0
            ? User.Organizations[0].OrganizationName
            : "")
   );

   const [configurationDrawer, setConfigurationDrawer] = useState(false);

   useEffect(() => {
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
   }

   return (
      <div>
         <>
            <div className={classes.configurationToggle}>
               <Tooltip
                  title="Configure work environment"
                  placement="left"
                  arrow
               >
                  <Button
                     variant="text"
                     color="inherit"
                     onClick={toggleConfigurationDrawer(true)}
                  >
                     <SettingsSharpIcon fontSize="large" color="primary" />
                  </Button>
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
         <EnvironmentPanel User={User} currentOrg={currentOrg} />
      </div>
   );
}

export default UserEnvironment;
