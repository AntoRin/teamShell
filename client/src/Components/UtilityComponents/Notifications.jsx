import { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import { SocketInstance } from "./ProtectedRoute";
import NotificationBlock from "./NotificationBlock";
import StatusBar from "../UtilityComponents/StatusBar";
import ConfirmDialog from "../UtilityComponents/ConfirmDialog";
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
   const [actionStatus, setActionStatus] = useState({
      info: null,
      type: "success",
   });
   const [confirmationRequired, setConfirmationRequired] = useState(false);
   const [notificationProgress, setNotificationProgress] = useState({
      pending: true,
      Hyperlink: null,
      InfoType: null,
      additionalInfo: null,
      confirmTitle: null,
      confirmMessage: null,
   });

   const socket = useContext(SocketInstance);

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
                  {notifications.map(notification => {
                     return (
                        <NotificationBlock
                           key={notification._id}
                           notification={notification}
                           setConfirmationRequired={setConfirmationRequired}
                           notificationProgress={notificationProgress}
                           setNotificationProgress={setNotificationProgress}
                           setActionStatus={setActionStatus}
                        />
                     );
                  })}
                  <Divider variant="inset" component="li" />
               </List>
               {actionStatus.info && (
                  <StatusBar
                     actionStatus={actionStatus}
                     setActionStatus={setActionStatus}
                  />
               )}
            </div>
         </ClickAwayListener>
         <ConfirmDialog
            setNotificationProgress={setNotificationProgress}
            confirmationRequired={confirmationRequired}
            setConfirmationRequired={setConfirmationRequired}
            title={notificationProgress.confirmTitle}
            message={notificationProgress.confirmMessage}
         />
      </>
   ) : null;
}

export default Notifications;
