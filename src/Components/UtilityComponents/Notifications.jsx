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

   const history = useHistory();

   const socket = useContext(SocketInstance);

   useEffect(() => {
      let abortFetch = new AbortController();

      async function getNotifications() {
         let notificationDataStream = await fetch(
            "http://localhost:5000/profile/notifications",
            { credentials: "include", signal: abortFetch.signal }
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
      }

      getNotifications();
      socket.on("user-data-change", () => getNotifications());

      return () => {
         abortFetch.abort();
         socket.off("user-data-change");
      };
   }, [setActiveNotifications, socket]);

   function performNotificationAction(event, action) {
      let redirectUrl = new URL(action);
      if (window.location.port !== redirectUrl.port)
         window.location.href = redirectUrl;
      else history.push(redirectUrl.pathname);
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
                                 src={notification.Initiator.ProfileImage}
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
                                                   notification.ActivityContent
                                                      .Action
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
                                                   classes["notification-spl"]
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
         </div>
      </ClickAwayListener>
   ) : null;
}

export default Notifications;
