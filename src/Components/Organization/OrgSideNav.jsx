import { useState } from "react";
import OrgSettingsModal from "./OrgSettingsModal";
import AppsIcon from "@material-ui/icons/Apps";
import SettingsIcon from "@material-ui/icons/Settings";
import "../../org-side-nav.css";

function OrgSideNav({ match, Organization }) {
   const [isNavOpen, setIsNavOpen] = useState(false);
   const [isSettingsOpen, setIsSettingsOpen] = useState(false);

   function toggleNav() {
      setIsNavOpen(prev => !prev);
   }

   function openSettingsModal() {
      setIsSettingsOpen(prev => !prev);
   }

   return (
      <div className="org-side-nav-container">
         {isSettingsOpen && (
            <OrgSettingsModal
               match={match}
               Organization={Organization}
               setIsSettingsOpen={setIsSettingsOpen}
            />
         )}
         <div className="sid-nav-tools">
            <AppsIcon
               onClick={toggleNav}
               fontSize="large"
               className="tool-icon"
            />
            <SettingsIcon
               onClick={openSettingsModal}
               fontSize="large"
               className="tool-icon"
            />
         </div>
         {isNavOpen && (
            <div className="side-nav-content">
               <div className="side-nav-projects side-nav-section">
                  <header className="side-nav-header">
                     <h3>Projects</h3>
                  </header>
                  <div className="side-nav-section-list">
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
               </div>
               <div className="side-nav-members side-nav-section">
                  <header className="side-nav-header">
                     <h3>Members</h3>
                  </header>
                  <div className="side-nav-section-list">
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
            </div>
         )}
      </div>
   );
}

export default OrgSideNav;
