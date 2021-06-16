import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import IconButton from "@material-ui/core/IconButton";
import ButtonBase from "@material-ui/core/ButtonBase";
import SettingsIcon from "@material-ui/icons/Settings";
import { Typography } from "@material-ui/core";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import OrgTabPanel from "../Organization/OrgTabPanel";
import OrgSettingsModal from "../Organization/OrgSettingsModal";
import LinearLoader from "../UtilityComponents/LinearLoader";

const useStyles = makeStyles(theme => ({
   orgHomeContainer: {
      marginTop: navHeight => navHeight,
   },
   root: navHeight => ({
      flexGrow: 1,
      backgroundColor: "rgb(18, 18, 23)",
      display: "flex",
      minHeight: `calc(100vh - ${navHeight}px)`,
      overflowY: "scroll",
      overflowX: "hidden",
      fontFamily: `"Roboto", sans-serif`,
   }),
   tabs: {
      borderRight: `1px solid ${theme.palette.divider}`,
      backgroundColor: "#111",
   },
   tab: {
      margin: "15px",
   },
   settings: {
      position: "fixed",
      bottom: "5px",
      left: "5px",
   },
   crumbs: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      margin: "10px",
      padding: "5px",
      borderBottom: "1px dashed rgb(108, 98, 190)",
      "& h6": {
         cursor: "pointer",
      },
      "& .MuiButtonBase-root": {
         display: "flex",
         justifyContent: "center",
         alignItems: "center",
         color: "#666",
         margin: "5px 0",
      },
      "& svg": {
         marginRight: "5px",
      },
      "& .orgTitle": {
         color: "lightgray",
      },
      "& .orgDescription": {
         color: "darkgray",
      },
   },
}));

function OrganizationHome({ match, User, navHeight }) {
   const classes = useStyles(navHeight);

   const [isAuthorized, setIsAuthorized] = useState(false);
   const [Organization, setOrganization] = useState({});
   const [isLoading, setIsLoading] = useState(true);
   const [tabName, setTabName] = useState("General Details");
   const [isSettingsOpen, setIsSettingsOpen] = useState(false);

   useEffect(() => {
      let abortFetch = new AbortController();
      async function getOrgData() {
         try {
            let orgRequest = await fetch(
               `/api/organization/details/${match.params.OrganizationName}`,
               {
                  signal: abortFetch.signal,
               }
            );

            if (abortFetch.signal.aborted) return;

            let orgResponse = await orgRequest.json();

            if (orgResponse.status === "ok") {
               setIsAuthorized(true);
               setOrganization(orgResponse.Organization);
               setIsLoading(false);
            } else {
               setIsAuthorized(false);
               setOrganization({});
               setIsLoading(false);
            }
         } catch (error) {
            console.error("The request was aborted");
         }
      }

      getOrgData();

      return () => abortFetch.abort();
   }, [match.params.OrganizationName]);

   function handleTabChange(event) {
      setTabName(event.target.textContent);
   }

   function openSettingsModal() {
      setIsSettingsOpen(prev => !prev);
   }

   if (isLoading) {
      return <LinearLoader />;
   } else {
      return isAuthorized ? (
         <div className={classes.orgHomeContainer}>
            <div className={classes.crumbs}>
               <>
                  <ButtonBase>
                     <AccountBalanceIcon fontSize="large" />
                     <Typography color="inherit" variant="h4" component="span">
                        Organization
                     </Typography>
                  </ButtonBase>
                  <Typography
                     className="orgTitle"
                     color="secondary"
                     variant="h4"
                     component="span"
                     gutterBottom={true}
                  >
                     {Organization.OrganizationName}
                  </Typography>
               </>
               <Typography
                  className="orgDescription"
                  color="inherit"
                  variant="h6"
                  gutterBottom={true}
               >
                  {Organization.Description}
               </Typography>
            </div>
            <div className={classes.root}>
               <Tabs
                  orientation="vertical"
                  indicatorColor="primary"
                  value={tabName}
                  onChange={handleTabChange}
                  className={classes.tabs}
               >
                  <Tab
                     className={classes.tab}
                     label="General Details"
                     value="General Details"
                  />
                  <Tab
                     className={classes.tab}
                     label="Projects"
                     value="Projects"
                  />
                  <Tab
                     className={classes.tab}
                     label="Members"
                     value="Members"
                  />
               </Tabs>
               <OrgTabPanel tabName={tabName} Organization={Organization} />
            </div>
            {Organization.Creator === User.UniqueUsername && (
               <IconButton
                  className={classes.settings}
                  onClick={openSettingsModal}
               >
                  <SettingsIcon color="primary" />
               </IconButton>
            )}
            <OrgSettingsModal
               User={User}
               match={match}
               Organization={Organization}
               isSettingsOpen={isSettingsOpen}
               setIsSettingsOpen={setIsSettingsOpen}
            />
         </div>
      ) : (
         <h1>There was an error</h1>
      );
   }
}

export default OrganizationHome;
