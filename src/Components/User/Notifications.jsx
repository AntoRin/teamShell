import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import "../../styles/notifications.css";

const useStyles = makeStyles(theme => ({
   root: {
      width: "100%",
      maxWidth: "36ch",
   },
   inline: {
      display: "inline",
      wordWrap: "normal",
   },
}));

function Notifications({ isNotificationsOpen, setActiveNotifications }) {
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

   return isNotificationsOpen ? (
      <div className="notifications-container">
         <List className={classes.root}>
            {notifications.map((notification, index) => {
               return (
                  <ListItem alignItems="flex-start">
                     <ListItemAvatar>
                        <Avatar
                           alt="Remy Sharp"
                           src={notification.NotificationInitiator.ProfileImage}
                        />
                     </ListItemAvatar>
                     <ListItemText
                        primary={notification.NotificationType}
                        secondary={
                           <React.Fragment>
                              {notification.NotificationType ===
                                 "Invitation" && (
                                 <div className="notification-block">
                                    <a
                                       className="notification-link"
                                       href={notification.Hyperlink}
                                    >
                                       <Typography
                                          component="span"
                                          variant="body1"
                                          className={classes.inline}
                                          color="secondary"
                                       >
                                          {
                                             notification.NotificationInitiator
                                                .UniqueUsername
                                          }{" "}
                                          has invited you to join the{" "}
                                          {
                                             notification.NotificationDest
                                                .Category
                                          }{" "}
                                          {notification.NotificationDest.Name}
                                       </Typography>
                                    </a>
                                 </div>
                              )}
                           </React.Fragment>
                        }
                     />
                  </ListItem>
               );
            })}
            <Divider variant="inset" component="li" />
         </List>
         {/* <div className="notification-panel">
            {notifications.map((notification, index) => {
               if (notification.NotificationType === "Link")
                  return (
                     <div key={index}>
                        <a href={notification.NotificationContent}>
                           {notification.NotificationHeader}
                        </a>
                     </div>
                  );
               else
                  return (
                     <div key={index}>{notification.NotificationContent}</div>
                  );
            })}
            <button onClick={clearNotifications}>Clear</button>
         </div> */}
      </div>
   ) : (
      ""
   );
}

export default Notifications;
