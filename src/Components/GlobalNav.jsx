import { useState } from "react";
import { Link } from "react-router-dom";
import UserDropDown from "./User/UserDropDown";
import "../global-nav.css";

function GlobalNav({ profileImage, UniqueUsername }) {
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

   function openDropdown() {
      setIsDropdownOpen(prev => !prev);
   }

   return (
      <nav className="global-nav-container">
         <div className="nav-wrapper">
            <div className="general-nav-section">
               <div className="nav-logo">
                  <Link to="/user/home">❤</Link>
               </div>
            </div>
            <div className="user-section">
               <div className="user-links-section">
                  <Link to="/user/projects">Projects</Link>
                  <Link to="/user/organizations">Organizations</Link>
               </div>
               <div className="profile-section">
                  <img
                     onClick={openDropdown}
                     id="userProfileImage"
                     src={profileImage}
                     alt=""
                  />
                  <div className="user-drop-down">
                     <UserDropDown
                        id="userProfileDropDown"
                        UniqueUsername={UniqueUsername}
                        isOpen={isDropdownOpen}
                     />
                  </div>
               </div>
            </div>
         </div>
      </nav>
   );
}

export default GlobalNav;
