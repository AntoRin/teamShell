import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import EnvironmentPanel from "./EnvironmentPanel";

function createTabProps(index) {
   return {
      id: `scrollable-auto-tab-${index}`,
      "aria-controls": `scrollable-auto-tabpanel-${index}`,
   };
}

const useStyles = makeStyles(theme => ({
   root: {
      flexGrow: 1,
      width: "100%",
      backgroundColor: "#111",
   },
   "app-bar": {
      backgroundColor: "#222",
   },
   tab: {
      color: "cyan",
      fontWeight: 700,
      textTransform: "none",
      fontSize: "1.2rem",
   },
}));

function UserEnvironment({ socket, User }) {
   const classes = useStyles();
   const [value, setValue] = useState(0);
   const [currentOrg, setCurrentOrg] = useState(
      User.Organizations.length > 0
         ? User.Organizations[0].OrganizationName
         : ""
   );

   function handleChange(event, newValue) {
      setValue(newValue);
      setCurrentOrg(event.target.textContent);
   }

   return (
      <div className="user-environment-container">
         <div className="environment-toolbar">
            <div className={classes.root}>
               <AppBar
                  className={classes["app-bar"]}
                  position="static"
                  color="secondary"
               >
                  <Tabs
                     value={value}
                     onChange={handleChange}
                     indicatorColor="primary"
                     textColor="secondary"
                     variant="scrollable"
                     scrollButtons="auto"
                     aria-label="scrollable tab"
                  >
                     {User.Organizations.length > 0 ? (
                        User.Organizations.map(org => {
                           return (
                              <Tab
                                 className={classes.tab}
                                 key={org._id}
                                 label={org.OrganizationName}
                                 {...createTabProps(org._id)}
                              />
                           );
                        })
                     ) : (
                        <Tab
                           className={classes.tab}
                           label="You are not part of any organization"
                        />
                     )}
                  </Tabs>
               </AppBar>
            </div>
            <EnvironmentPanel
               socket={socket}
               User={User}
               currentOrg={currentOrg}
            />
         </div>
      </div>
   );
}

export default UserEnvironment;
