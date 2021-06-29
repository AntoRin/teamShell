import User from "../models/User";

import AppError from "./AppError";
import { UserNotificationType } from "../interfaces/UserModel";
import { AuthenticatedRequest } from "../types";
import { NextFunction, Response } from "express";

function notifyGroup(
   initiator: string,
   recipientGroup: string,
   groupType: string,
   notification: UserNotificationType
): Promise<void> {
   const groupSelector =
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

         return resolve();
      } catch (error) {
         return reject(error);
      }
   });
}

function notifySingleUser(
   recipientName: string,
   notification: UserNotificationType
): Promise<void> {
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

         return resolve();
      } catch (error) {
         return reject(error);
      }
   });
}

async function handleNotifications(
   req: AuthenticatedRequest,
   res: Response,
   next: NextFunction
) {
   try {
      const { notifications } = req;

      if (!notifications) throw new AppError("ServerError");

      let successMessage = null;

      for (let notification of notifications) {
         const { metaData, ...notificationData } = notification;

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

export { handleNotifications };
