import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Tooltip from "@material-ui/core/Tooltip";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
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
   appBar: {
      backgroundColor: "rgb(15, 20, 40)",
   },
   tab: {
      color: "cyan",
      fontWeight: 700,
      textTransform: "none",
      fontSize: "1.2rem",
   },
   localSettingsIcon: {
      cursor: "pointer",
      margin: "10px",
   },
}));

function UserEnvironment({ User }) {
   const classes = useStyles();
   const [currentOrg, setCurrentOrg] = useState(
      window.localStorage.getItem("environment_organization_context") ||
         (User.Organizations.length > 0
            ? User.Organizations[0].OrganizationName
            : "")
   );
   const [value, setValue] = useState(
      currentOrg
         ? () => {
              let initialTabIndex = 0;
              User.Organizations.forEach((org, index) => {
                 if (org.OrganizationName === currentOrg) {
                    initialTabIndex = index;
                    return;
                 }
              });
              return initialTabIndex;
           }
         : 0
   );
   const [displayOrgNav, setDisplayOrgNav] = useState(false);

   useEffect(() => {
      window.localStorage.setItem(
         "environment_organization_context",
         currentOrg
      );
   }, [currentOrg]);

   function handleTabChange(event, newValue) {
      setValue(newValue);
      setCurrentOrg(event.target.textContent);
   }

   function changeOrgNavState() {
      setDisplayOrgNav(prev => !prev);
   }

   return (
      <div className="user-environment-container">
         <Tooltip title="Change current organization" placement="right" arrow>
            <AccountTreeIcon
               className={classes.localSettingsIcon}
               fontSize="large"
               onClick={changeOrgNavState}
            />
         </Tooltip>
         {displayOrgNav && (
            <div className={classes.root}>
               <AppBar
                  className={classes.appBar}
                  position="static"
                  color="secondary"
               >
                  <Tabs
                     value={value}
                     onChange={handleTabChange}
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
         )}
         <EnvironmentPanel User={User} currentOrg={currentOrg} />
      </div>
   );
}

export default UserEnvironment;
