import { useState, useEffect } from "react";
import "../../notifications.css";

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
   });
   return isNotificationsOpen ? (
      <div className="notifications-container">
         <div className="notification-panel">
            {notifications.map((notification, index) => {
               if (notification.NotificationType === "Link")
                  return (
                     <div key={index}>
                        <a href={notification.NotificationContent}>Join Org</a>
                     </div>
                  );
               else
                  return (
                     <div key={index}>{notification.NotificationContent}</div>
                  );
            })}
         </div>
      </div>
   ) : (
      ""
   );
}

export default Notifications;
