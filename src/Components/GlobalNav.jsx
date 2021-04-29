import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NotificationsIcon from "@material-ui/icons/Notifications";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";
import Notifications from "./User/Notifications";
import UserDropDown from "./User/UserDropDown";
import "../styles/global-nav.css";

function GlobalNav({ ProfileImage, UniqueUsername }) {
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
   const [activeNotifications, setActiveNotifications] = useState(false);

   const NotifyIcon = activeNotifications
      ? NotificationsActiveIcon
      : NotificationsIcon;

   useEffect(() => {
      if (!activeNotifications || !isNotificationsOpen) return;

      let abortFetch = new AbortController();

      async function changeNotificationSeenStatus() {
         let responseStream = await fetch(
            "http://localhost:5000/profile/notifications/seen",
            {
               credentials: "include",
               signal: abortFetch.signal,
            }
         );

         let responseData = await responseStream.json();
         console.log(responseData);
      }

      changeNotificationSeenStatus();

      return () => abortFetch.abort();
   }, [isNotificationsOpen, activeNotifications]);

   function openDropdown() {
      setIsDropdownOpen(prev => !prev);
   }

   function toggleNotifications() {
      setIsNotificationsOpen(prev => !prev);
   }

   return (
      <nav className="global-nav-container">
         <div className="nav-wrapper">
            <div className="general-nav-section">
               <div className="nav-logo">
                  <Link to="/user/home">{`<CoLab />`}</Link>
               </div>
            </div>
            <div className="user-section">
               <div className="user-links-section">
                  <Link to="/user/environment">Your Environment</Link>
               </div>
               <div className="notifications-section">
                  <NotifyIcon
                     className="notification-icon"
                     onClick={toggleNotifications}
                  />
                  <Notifications
                     setActiveNotifications={setActiveNotifications}
                     isNotificationsOpen={isNotificationsOpen}
                     setIsNotificationsOpen={setIsNotificationsOpen}
                  />
               </div>
               <div className="profile-section">
                  <img
                     onClick={openDropdown}
                     id="userProfileImage"
                     src={ProfileImage}
                     alt=""
                  />
                  <div className="user-drop-down">
                     <UserDropDown
                        id="userProfileDropDown"
                        UniqueUsername={UniqueUsername}
                        isOpen={isDropdownOpen}
                        setIsDropdownOpen={setIsDropdownOpen}
                     />
                  </div>
               </div>
            </div>
         </div>
      </nav>
   );
}

export default GlobalNav;
