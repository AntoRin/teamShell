import { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import { SocketInstance } from "./ProtectedRoute";
import { GlobalActionStatus } from "../App";
import NotificationBlock from "./NotificationBlock";
import "../../styles/notifications.css";

const useStyles = makeStyles(theme => ({
   root: {
      width: "100%",
   },
   inline: {
      display: "inline",
      wordWrap: "break-word",
      wordBreak: "keep-all",
      color: "white",
      fontWeight: 500,
   },
   "notification-initiator": {
      fontWeight: 1000,
   },
   "notification-keyword": {
      color: "cyan",
   },
   "notification-spl": {
      color: "red",
   },
}));

function Notifications({
   isNotificationsOpen,
   setIsNotificationsOpen,
   setActiveNotifications,
}) {
   const classes = useStyles();

   const [notifications, setNotifications] = useState([]);

   const socket = useContext(SocketInstance);
   const setActionStatus = useContext(GlobalActionStatus);

   useEffect(() => {
      let abortFetch = new AbortController();

      async function getNotifications() {
         try {
            let notificationDataStream = await fetch(
               "/api/profile/notifications",
               {
                  credentials: "include",
                  signal: abortFetch.signal,
               }
            );

            if (abortFetch.signal.aborted) return;

            let notificationData = await notificationDataStream.json();
            if (notificationData.status === "ok") {
               let { Notifications } = notificationData.data;

               let unreadNotification = Notifications.find(
                  notification => notification.Seen === false
               );

               if (Notifications.length > 0) {
                  setNotifications(Notifications);
                  if (unreadNotification) {
                     setActiveNotifications(true);
                  } else {
                     setActiveNotifications(false);
                  }
               }
            }
         } catch (error) {
            console.log(error);
         }
      }

      getNotifications();
      socket.on("user-data-change", () => getNotifications());

      return () => {
         abortFetch.abort();
         socket.off("user-data-change");
      };
   }, [setActiveNotifications, socket]);

   function closeNotifications() {
      setIsNotificationsOpen(false);
   }

   return isNotificationsOpen ? (
      <>
         <ClickAwayListener onClickAway={closeNotifications}>
            <div className="notifications-container">
               <List className={classes.root}>
                  {notifications.length > 0 &&
                     notifications.map(notification => {
                        return (
                           <NotificationBlock
                              key={notification._id}
                              notification={notification}
                              setActionStatus={setActionStatus}
                           />
                        );
                     })}
                  <Divider variant="inset" component="li" />
               </List>
            </div>
         </ClickAwayListener>
      </>
   ) : null;
}

export default Notifications;
