import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
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

function NotificationBlock({
   notification,
   setConfirmationRequired,
   notificationProgress,
   setNotificationProgress,
   setActionStatus,
}) {
   const classes = useStyles();

   const [initiatorProfileImage, setInitiatorProfileImage] = useState(null);

   const history = useHistory();

   useEffect(() => {
      async function getInitiatorProfileImage() {
         try {
            let responseStream = await fetch(
               `/api/profile/profile-image/${notification.Initiator}`
            );

            if (responseStream.status === 204) return;

            let responseData = await responseStream.json();

            if (responseData.status === "ok" && responseData.data)
               setInitiatorProfileImage(responseData.data);
            else if (responseData.status === "error") throw responseData.error;
         } catch (error) {
            console.log(error);
            return;
         }
      }

      getInitiatorProfileImage();
   }, [notification.Initiator]);

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
   }, [
      notificationProgress,
      history,
      setActionStatus,
      setNotificationProgress,
   ]);

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

   return (
      <div
         onClick={() =>
            handleNotificationClick(
               notification.Hyperlink,
               notification.InfoType,
               notification.Initiator,
               notification.ActivityContent.Keyword
            )
         }
         className="notification-block"
      >
         <ListItem alignItems="flex-start">
            <ListItemAvatar>
               <Avatar
                  src={
                     initiatorProfileImage
                        ? initiatorProfileImage.startsWith("https://")
                           ? initiatorProfileImage
                           : `data:image/jpeg;base64,${initiatorProfileImage}`
                        : "/assets/UserIcon.png"
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
                                       classes["notification-initiator"]
                                    }
                                 >
                                    {notification.Initiator}
                                 </span>
                              }{" "}
                              <span>{notification.ActivityContent.Action}</span>{" "}
                              {
                                 <span
                                    className={classes["notification-keyword"]}
                                 >
                                    {notification.ActivityContent.Keyword}
                                 </span>
                              }
                              <br />
                              <span className={classes["notification-spl"]}>
                                 {notification.Target.Info}
                              </span>
                              <br />
                              <span>{formatDate(notification.createdAt)}</span>
                           </Typography>
                        </div>
                     }
                  </>
               }
            />
         </ListItem>
      </div>
   );
}

export default NotificationBlock;
