import { useState, useEffect } from "react";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
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

   useEffect(() => {
      async function getNotifications() {
         let notificationDataStream = await fetch(
            "http://localhost:5000/profile/notifications",
            { credentials: "include" }
         );
         let notificationData = await notificationDataStream.json();
         if (notificationData.status === "ok") {
            let { Notifications } = notificationData.data;
            if (Notifications.length > 0) {
               setNotifications(Notifications);
               setActiveNotifications(true);
            }
         }
      }

      getNotifications();
   }, [setActiveNotifications]);

   async function clearNotifications() {
      let update = await fetch(
         "http://localhost:5000/profile/notifications/clear",
         { credentials: "include" }
      );
      let updateResponse = await update.json();
      if (updateResponse.status === "ok") window.location.reload();
   }

   function performNotificationAction(event, action) {
      window.location.href = action;
   }

   function closeNotifications() {
      setIsNotificationsOpen(false);
   }

   return isNotificationsOpen ? (
      <ClickAwayListener onClickAway={closeNotifications}>
         <div className="notifications-container">
            <List className={classes.root}>
               {notifications.map(notification => {
                  return (
                     <div
                        key={notification._id}
                        onClick={event =>
                           performNotificationAction(
                              event,
                              notification.Hyperlink
                           )
                        }
                        className="notification-block"
                     >
                        <ListItem alignItems="flex-start">
                           <ListItemAvatar>
                              <Avatar
                                 alt=""
                                 src={
                                    notification.NotificationInitiator
                                       .ProfileImage
                                 }
                              />
                           </ListItemAvatar>
                           <ListItemText
                              disableTypography={true}
                              primary={notification.NotificationType}
                              secondary={
                                 <>
                                    {notification.NotificationType ===
                                       "Invitation" && (
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
                                                      notification
                                                         .NotificationInitiator
                                                         .UniqueUsername
                                                   }
                                                </span>
                                             }{" "}
                                             has invited you to join{" "}
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
                                                         .NotificationCaller
                                                         .Name
                                                   }
                                                </span>
                                             }
                                             <br />
                                             <span
                                                className={
                                                   classes["notification-spl"]
                                                }
                                             >
                                                {
                                                   notification
                                                      .NotificationCaller.Info
                                                }
                                             </span>
                                             <br />
                                             <span>
                                                {formatDate(
                                                   notification.createdAt
                                                )}
                                             </span>
                                          </Typography>
                                       </div>
                                    )}
                                 </>
                              }
                           />
                        </ListItem>
                     </div>
                  );
               })}
               <Divider variant="inset" component="li" />
            </List>
         </div>
      </ClickAwayListener>
   ) : null;
}

export default Notifications;
