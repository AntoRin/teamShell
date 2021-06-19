import { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import NotificationConfirmDialog from "./NotificationConfirmDialog";
import formatDate from "../../utils/formatDate";

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

function NotificationBlock({ notification, setActionStatus }) {
   const classes = useStyles();

   const [confirmationRequired, setConfirmationRequired] = useState(false);
   const [isNotificationPending, setIsNotificationPending] = useState(true);
   const [confirmData, setConfirmData] = useState({ title: "", message: "" });

   const history = useHistory();

   useEffect(() => {
      if (isNotificationPending) return;

      let abortFetch = new AbortController();

      async function performNotificationAction() {
         try {
            if (notification.NotificationType === "Invitation") {
               let responseStream = await fetch(notification.NotificationLink, {
                  signal: abortFetch.signal,
               });

               if (abortFetch.signal.aborted) return;

               let responseData = await responseStream.json();

               if (responseData.status === "error")
                  return setActionStatus({
                     info: responseData.error,
                     type: "error",
                  });

               return history.push(responseData.data.url);
            } else if (notification.NotificationType === "Request") {
               let responseStream = await fetch(notification.NotificationLink, {
                  signal: abortFetch.signal,
               });

               if (abortFetch.signal.aborted) return;

               let responseData = await responseStream.json();

               if (responseData.status === "ok")
                  setActionStatus({
                     info: "Added user to project",
                     type: "success",
                  });
               else
                  setActionStatus({
                     info: "There was an error",
                     type: "error",
                  });
            } else {
               history.push(notification.NotificationLink);
            }
         } catch (error) {
            console.log(error);
            return;
         } finally {
            if (!abortFetch.signal.aborted) setIsNotificationPending(true);
         }
      }
      performNotificationAction();

      return () => abortFetch.abort();
   }, [
      notification,
      isNotificationPending,
      setIsNotificationPending,
      history,
      setActionStatus,
   ]);

   function handleNotificationClick() {
      let message,
         title,
         requireConfirmation = false;

      switch (notification.NotificationType) {
         case "Invitation":
            title = "Invitation";
            message = `Do you want to join the ${notification.NotificationAction.slice(
               notification.NotificationAction.indexOf("project") !== -1
                  ? notification.NotificationAction.indexOf("project")
                  : notification.NotificationAction.indexOf("organization")
            )}?`;
            requireConfirmation = true;
            break;
         case "Request":
            title = "Request";
            message = `Do you want to accept the user's request to join ${notification.NotificationAction.slice(
               notification.NotificationAction.indexOf("project") !== -1
                  ? notification.NotificationAction.indexOf("project")
                  : notification.NotificationAction.indexOf("organization")
            )}?`;
            requireConfirmation = true;
            break;
         default:
            requireConfirmation = false;
      }

      setConfirmData({ title, message });
      setIsNotificationPending(requireConfirmation);
      setConfirmationRequired(requireConfirmation);
   }

   return (
      <>
         <div onClick={handleNotificationClick} className="notification-block">
            <ListItem alignItems="flex-start">
               <ListItemAvatar>
                  <Avatar
                     src={`/api/profile/profile-image/${notification.Initiator}`}
                     alt=""
                  />
               </ListItemAvatar>
               <ListItemText
                  disableTypography={true}
                  primary={notification.NotificationTitle}
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
                                          classes["notification-initiator"]
                                       }
                                    >
                                       {notification.Initiator}
                                    </span>
                                 }{" "}
                                 <span>{notification.NotificationAction}</span>{" "}
                                 <br />
                                 {notification.OtherLinks.length > 0 &&
                                    notification.OtherLinks.map(
                                       (link, linkIdx) => (
                                          <span
                                             key={linkIdx}
                                             className={
                                                classes["notification-spl"]
                                             }
                                          >
                                             <Link to={link.Link}>
                                                {link.Name}
                                             </Link>
                                          </span>
                                       )
                                    )}
                                 <br />
                                 <span>
                                    {formatDate(notification.createdAt)}
                                 </span>
                              </Typography>
                           </div>
                        }
                     </>
                  }
               />
            </ListItem>
         </div>
         <NotificationConfirmDialog
            setIsNotificationPending={setIsNotificationPending}
            confirmationRequired={confirmationRequired}
            setConfirmationRequired={setConfirmationRequired}
            title={confirmData.title}
            message={confirmData.message}
         />
      </>
   );
}

export default NotificationBlock;
