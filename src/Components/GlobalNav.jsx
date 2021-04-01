import { useState } from "react";
import { Link } from "react-router-dom";
import NotificationsIcon from "@material-ui/icons/Notifications";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";
import Notifications from "./User/Notifications";
import UserDropDown from "./User/UserDropDown";
import "../global-nav.css";

function GlobalNav({ profileImage, UniqueUsername }) {
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
   const [activeNotifications, setActiveNotifications] = useState(false);

   const NotifyIcon = activeNotifications
      ? NotificationsActiveIcon
      : NotificationsIcon;

   function openDropdown() {
      setIsDropdownOpen(prev => !prev);
   }

   function openNotifications() {
      setIsNotificationsOpen(prev => !prev);
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
                  <Link to="/user/environment">Your Environment</Link>
               </div>
               <div className="notifications-section">
                  <NotifyIcon
                     className="notification-icon"
                     onClick={openNotifications}
                  />
                  <Notifications
                     setActiveNotifications={setActiveNotifications}
                     isNotificationsOpen={isNotificationsOpen}
                  />
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
