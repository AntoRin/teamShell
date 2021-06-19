const User = require("../models/User");
const Issue = require("../models/Issue");

const AppError = require("./AppError");

function notifyGroup(initiator, recipientGroup, groupType, notification) {
   let groupSelector =
      groupType === "Organization"
         ? "Organizations.OrganizationName"
         : "Projects.ProjectName";

   return new Promise(async (resolve, reject) => {
      try {
         await User.updateMany(
            {
               UniqueUsername: { $ne: initiator },
               [groupSelector]: recipientGroup,
            },
            {
               $push: {
                  Notifications: { $each: [notification], $position: 0 },
               },
            }
         );

         resolve();
      } catch (error) {
         reject(error);
      }
   });
}

function notifySingleUser(recipientName, notification) {
   return new Promise(async (resolve, reject) => {
      try {
         await User.updateOne(
            { UniqueUsername: recipientName },
            {
               $push: {
                  Notifications: { $each: [notification], $position: 0 },
               },
            }
         );

         resolve();
      } catch (error) {
         reject(error);
      }
   });
}

async function handleNotifications(req, res, next) {
   try {
      let { notifications } = req;

      let successMessage = null;

      for (let notification of notifications) {
         console.log(notification);
         let { metaData, ...notificationData } = notification;

         if (!notification) throw new AppError("ServerError");

         switch (metaData.recipientType) {
            case "SingleUser": {
               await notifySingleUser(metaData.recipient, notificationData);
               successMessage =
                  metaData.successMessage && metaData.successMessage;
               break;
            }
            case "Group": {
               let initiator = notificationData.Initiator;
               await notifyGroup(
                  initiator,
                  metaData.recipient,
                  metaData.groupType,
                  notification
               );

               successMessage =
                  metaData.successMessage && metaData.successMessage;
               break;
            }
         }
      }
      return res.json({
         status: "ok",
         data: successMessage ? successMessage : "Done",
      });
   } catch (error) {
      return next(error);
   }
}

module.exports = { handleNotifications };
