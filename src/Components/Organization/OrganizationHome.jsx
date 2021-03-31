import { useState, useEffect } from "react";
import GlobalNav from "../GlobalNav";
import "../../organization-home.css";

function OrganizationHome({ match, User }) {
   const [isAuthorized, setIsAuthorized] = useState(false);
   const [Organization, setOrganization] = useState({});
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      async function getOrgData() {
         let orgRequest = await fetch(
            `http://localhost:5000/organization/details/${match.params.OrganizationName}`,
            {
               credentials: "include",
            }
         );

         let orgResponse = await orgRequest.json();
         console.log(orgResponse);

         if (orgResponse.status === "ok") {
            setIsAuthorized(true);
            setOrganization(orgResponse.Organization);
            setIsLoading(false);
         } else {
            setIsAuthorized(false);
            setOrganization({});
            setIsLoading(false);
         }
      }

      getOrgData();
   }, [match.params.OrganizationName]);

   if (isLoading) {
      return <h1>Loading...</h1>;
   } else {
      return isAuthorized ? (
         <div className="organization-home-container">
            <GlobalNav
               profileImage={User.ProfileImage}
               UniqueUsername={User.UniqueUsername}
            />
            <div className="org-main-wrapper">
               <div className="org-side-nav">
                  <div className="side-nav-projects side-nav-section">
                     <header className="side-nav-header">
                        <h3>Projects</h3>
                     </header>
                     {Organization.Projects.map((project, index) => {
                        return (
                           <div className="side-nav-section-member" key={index}>
                              <button
                                 className="side-nav-list-btn"
                                 type="button"
                              >
                                 {project}
                              </button>
                           </div>
                        );
                     })}
                  </div>
                  <div className="side-nav-members side-nav-section">
                     <header className="side-nav-header">
                        <h3>Members</h3>
                     </header>

                     {Organization.Members.map((member, index) => {
                        return (
                           <div className="side-nav-section-member" key={index}>
                              <button
                                 className="side-nav-list-btn"
                                 type="button"
                              >
                                 {member}
                              </button>
                           </div>
                        );
                     })}
                  </div>
               </div>
               <div className="org-page-body"></div>
            </div>
         </div>
      ) : (
         <h1>You're not authorized to view this page</h1>
      );
   }
}

export default OrganizationHome;
