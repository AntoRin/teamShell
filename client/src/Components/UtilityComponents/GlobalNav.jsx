import { useState, useEffect, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import NotificationsIcon from "@material-ui/icons/Notifications";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";
import StorageIcon from "@material-ui/icons/Storage";
import { Button } from "@material-ui/core";
import DeveloperModeIcon from "@material-ui/icons/DeveloperMode";
import Notifications from "./Notifications";
import ChatHistory from "./ChatHistory";
import UserDropDown from "./UserDropDown";
import "../../styles/global-nav.css";

function GlobalNav({
   ProfileImage,
   UniqueUsername,
   setChatSettings,
   setNavHeight,
}) {
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
   const [activeNotifications, setActiveNotifications] = useState(false);
   const [chatHistoryState, setChatHistoryState] = useState(false);

   const navRef = useRef();

   const history = useHistory();

   const NotifyIcon = activeNotifications
      ? NotificationsActiveIcon
      : NotificationsIcon;

   useEffect(() => {
      if (!activeNotifications || !isNotificationsOpen) return;

      let abortFetch = new AbortController();

      async function changeNotificationSeenStatus() {
         try {
            let responseStream = await fetch(
               "/api/profile/notifications/seen",
               {
                  credentials: "include",
                  signal: abortFetch.signal,
               }
            );

            let responseData = await responseStream.json();
            console.log(responseData);
         } catch (error) {
            console.log(error);
            return;
         }
      }
      changeNotificationSeenStatus();

      return () => abortFetch.abort();
   }, [isNotificationsOpen, activeNotifications]);

   useEffect(() => {
      setNavHeight(
         Math.max(
            navRef.current.offsetHeight,
            navRef.current.clientHeight,
            navRef.current.scrollHeight
         )
      );
   }, [setNavHeight]);

   function openDropdown() {
      setIsDropdownOpen(prev => !prev);
   }

   function toggleNotifications() {
      setIsNotificationsOpen(prev => !prev);
   }

   function toggleMessageHistory() {
      setChatHistoryState(prev => !prev);
   }

   function goToWorkspace() {
      history.push("/user/environment");
   }

   return (
      <nav ref={navRef} className="global-nav-container">
         <div className="nav-wrapper">
            <div className="general-nav-section">
               <div className="nav-logo">
                  <Link to="/user/home">teamShell</Link>
               </div>
            </div>
            <div className="user-section">
               <div className="user-links-section">
                  <Button
                     variant="text"
                     color="primary"
                     size="large"
                     endIcon={<DeveloperModeIcon fontSize="large" />}
                     onClick={goToWorkspace}
                  >
                     Workspace
                  </Button>
               </div>
               <div className="notifications-section">
                  <NotifyIcon
                     className="nav-icon"
                     onClick={toggleNotifications}
                  />
                  <Notifications
                     setActiveNotifications={setActiveNotifications}
                     isNotificationsOpen={isNotificationsOpen}
                     setIsNotificationsOpen={setIsNotificationsOpen}
                  />
               </div>
               <div className="message-section">
                  <StorageIcon
                     fontSize="large"
                     className="nav-icon"
                     onClick={toggleMessageHistory}
                  />
                  <ChatHistory
                     UniqueUsername={UniqueUsername}
                     chatHistoryState={chatHistoryState}
                     setChatHistoryState={setChatHistoryState}
                     setChatSettings={setChatSettings}
                  />
               </div>
               <div className="profile-section">
                  <img
                     onClick={openDropdown}
                     id="userProfileImage"
                     src={
                        ProfileImage.startsWith("https://")
                           ? ProfileImage
                           : `data:image/jpeg;base64,${ProfileImage}`
                     }
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
