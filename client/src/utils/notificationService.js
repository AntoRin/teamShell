async function initiateNewNotification({ initiator, recipient, metaData }) {
   let body = {
      initiator,
      recipient,
      metaData,
   };

   let postOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
   };

   let notificationStream = await fetch("/profile/notifications", postOptions);

   let notificationData = await notificationStream.json();

   return notificationData;
}

export default initiateNewNotification;
