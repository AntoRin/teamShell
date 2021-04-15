import { useState, useEffect } from "react";
import "../../styles/notifications.css";

function Notifications({ isNotificationsOpen, setActiveNotifications }) {
   const [notifications, setNotifications] = useState([]);

   useEffect(() => {
      async function getNotifications() {
         let notificationsRequest = await fetch(
            "http://localhost:5000/profile/notifications",
            { credentials: "include" }
         );
         let notificationsResponse = await notificationsRequest.json();
         if (notificationsResponse.status === "ok") {
            let { Notifications } = notificationsResponse;
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
         <div className="notification-panel">
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
         </div>
      </div>
   ) : (
      ""
   );
}

export default Notifications;
