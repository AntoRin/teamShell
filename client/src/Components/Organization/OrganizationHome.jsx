import { useState, useEffect } from "react";
import OrgSideNav from "./OrgSideNav";
import DetailCard from "../User/DetailCard";
import LinearLoader from "../UtilityComponents/LinearLoader";
import "../../styles/organization-home.css";

function OrganizationHome({ match, User }) {
   const [isAuthorized, setIsAuthorized] = useState(false);
   const [Organization, setOrganization] = useState({});
   const [isLoading, setIsLoading] = useState(true);

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

   if (isLoading) {
      return <LinearLoader />;
   } else {
      return isAuthorized ? (
         <div className="organization-home-container">
            <div className="org-main-wrapper">
               <OrgSideNav
                  User={User}
                  match={match}
                  Organization={Organization}
               />
               <div className="org-page-body">
                  <div className="org-general-details-card">
                     <header className="org-details-header">
                        <h1>{Organization.OrganizationName}</h1>
                     </header>
                     <div className="org-details-content">
                        <DetailCard
                           header="Description"
                           detail={Organization.Description}
                        />
                        <DetailCard
                           header="Created By"
                           detail={Organization.Creator}
                        />
                        <DetailCard
                           header="No. of Projects"
                           detail={Organization.Projects.length}
                        />
                        <DetailCard
                           header="No. of Members"
                           detail={Organization.Members.length}
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      ) : (
         <h1>There was an error</h1>
      );
   }
}

export default OrganizationHome;
