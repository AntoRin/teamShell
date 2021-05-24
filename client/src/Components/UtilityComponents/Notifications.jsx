import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import { SocketInstance } from "./ProtectedRoute";
import StatusBar from "../UtilityComponents/StatusBar";
import ConfirmDialog from "../UtilityComponents/ConfirmDialog";
import formatDate from "../../utils/formatDate";
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

   const history = useHistory();

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

   useEffect(() => {
      if (notificationProgress.pending) return;

      async function performNotificationAction() {
         if (notificationProgress.InfoType === "Invitation") {
            let notificationAction = await fetch(
               notificationProgress.Hyperlink
            );
            if (notificationAction.redirected) {
               let redirectUrl = new URL(notificationAction.url);
               history.replace(redirectUrl.pathname);
               return;
            }

            let actionData = await notificationAction.json();

            if (actionData.status === "error")
               setActionStatus({ info: actionData.error, type: "error" });
         } else if (notificationProgress.InfoType === "Request") {
            let postOptions = {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  newUser: notificationProgress.additionalInfo.InitiatorName,
                  requestedProject:
                     notificationProgress.additionalInfo.target_name,
               }),
            };
            let notificationAction = await fetch(
               `/api/project/accept/new-user`,
               postOptions
            );
            let responseData = await notificationAction.json();
            console.log(responseData);

            if (responseData.status === "ok")
               setActionStatus({
                  info: "Added user to project",
                  type: "success",
               });
            else setActionStatus({ info: "There was an error", type: "error" });
         } else {
            history.push(notificationProgress.Hyperlink);
         }
      }
      performNotificationAction();

      setNotificationProgress({
         pending: true,
         Hyperlink: null,
         InfoType: null,
         additionalInfo: null,
         confirmTitle: null,
         confirmMessage: null,
      });
   }, [notificationProgress, history]);

   function handleNotificationClick(
      Hyperlink,
      InfoType,
      InitiatorName,
      target_name
   ) {
      let message,
         title,
         requireConfirmation = false;

      switch (InfoType) {
         case "Invitation":
            title = "Invitation";
            message = `Do you want to join ${target_name}?`;
            requireConfirmation = true;
            break;
         case "Request":
            title = "Request";
            message = `Do you want to accept the user's request to join ${target_name}?`;
            requireConfirmation = true;
            break;
         default:
            requireConfirmation = false;
      }

      setNotificationProgress({
         pending: requireConfirmation,
         Hyperlink,
         InfoType,
         additionalInfo: { InitiatorName, target_name },
         confirmTitle: title,
         confirmMessage: message,
      });

      setConfirmationRequired(requireConfirmation);
   }

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
                        <div
                           key={notification._id}
                           onClick={() =>
                              handleNotificationClick(
                                 notification.Hyperlink,
                                 notification.InfoType,
                                 notification.Initiator.UniqueUsername,
                                 notification.ActivityContent.Keyword
                              )
                           }
                           className="notification-block"
                        >
                           <ListItem alignItems="flex-start">
                              <ListItemAvatar>
                                 <Avatar
                                    src={
                                       notification.Initiator.ProfileImage.startsWith(
                                          "https://"
                                       )
                                          ? notification.Initiator.ProfileImage
                                          : `data:image/jpeg;base64,${notification.Initiator.ProfileImage}`
                                    }
                                    alt=""
                                 />
                              </ListItemAvatar>
                              <ListItemText
                                 disableTypography={true}
                                 primary={notification.InfoType}
                                 secondary={
                                    <>
                                       {
                                          <div className="notification-text-content">
                                             <Typography
                                                component="span"
                                                variant="body1"
                                                className={classes.inline}
                                             >
                                                {
                                                   <span
                                                      className={
                                                         classes[
                                                            "notification-initiator"
                                                         ]
                                                      }
                                                   >
                                                      {
                                                         notification.Initiator
                                                            .UniqueUsername
                                                      }
                                                   </span>
                                                }{" "}
                                                <span>
                                                   {
                                                      notification
                                                         .ActivityContent.Action
                                                   }
                                                </span>{" "}
                                                {
                                                   <span
                                                      className={
                                                         classes[
                                                            "notification-keyword"
                                                         ]
                                                      }
                                                   >
                                                      {
                                                         notification
                                                            .ActivityContent
                                                            .Keyword
                                                      }
                                                   </span>
                                                }
                                                <br />
                                                <span
                                                   className={
                                                      classes[
                                                         "notification-spl"
                                                      ]
                                                   }
                                                >
                                                   {notification.Target.Info}
                                                </span>
                                                <br />
                                                <span>
                                                   {formatDate(
                                                      notification.createdAt
                                                   )}
                                                </span>
                                             </Typography>
                                          </div>
                                       }
                                    </>
                                 }
                              />
                           </ListItem>
                        </div>
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
