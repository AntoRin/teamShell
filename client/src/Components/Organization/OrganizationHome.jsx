import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import OrgTabPanel from "./OrgTabPanel";
import OrgSideNav from "./OrgSideNav";
import LinearLoader from "../UtilityComponents/LinearLoader";
import "../../styles/organization-home.css";

const useStyles = makeStyles(theme => ({
   root: {
      flexGrow: 1,
      backgroundColor: "rgb(18, 18, 23)",
      display: "flex",
      minHeight: "80vh",
      overflowY: "scroll",
   },
   tabs: {
      borderRight: `1px solid ${theme.palette.divider}`,
      backgroundColor: "#111",
   },
   tab: {
      margin: "15px",
   },
}));

function OrganizationHome({ match, User }) {
   const classes = useStyles();

   const [isAuthorized, setIsAuthorized] = useState(false);
   const [Organization, setOrganization] = useState({});
   const [isLoading, setIsLoading] = useState(true);
   const [tabName, setTabName] = useState("General Details");

   useEffect(() => {
      let abortFetch = new AbortController();
      async function getOrgData() {
         try {
            let orgRequest = await fetch(
               `/organization/details/${match.params.OrganizationName}`,
               {
                  credentials: "include",
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

   if (isLoading) {
      return <LinearLoader />;
   } else {
      return isAuthorized ? (
         <div className="organization-home-container">
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
         </div>
      ) : (
         <h1>There was an error</h1>
      );
   }
}

export default OrganizationHome;
