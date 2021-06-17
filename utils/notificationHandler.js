const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Issue = require("../models/Issue");

const AppError = require("./AppError");

function notifyAllInProject(initiator, recipient, notification) {
   return new Promise(async (resolve, reject) => {
      try {
         await User.updateMany(
            {
               "Projects.ProjectName": recipient,
               UniqueUsername: { $ne: initiator },
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

async function handleNotifications(req, res, next) {
   let { initiator, recipient, metaData } = req.body;

   let payloadBlueprint = {
      Initiator: initiator,
      Target: {
         Category: metaData.target_category,
         Name: metaData.target_name,
         Info: metaData.target_info,
      },
   };

   try {
      switch (metaData.notification_type) {
         case "Invitation": {
            let user = await User.findOne({ UniqueUsername: recipient });
            if (!user) throw new AppError("UnauthorizedRequestError");

            let jwtPayloadName, routeBaseName;

            if (metaData.target_category === "Organization") {
               jwtPayloadName = "OrganizationName";
               routeBaseName = "organization";
            } else if (metaData.target_category === "Project") {
               jwtPayloadName = "ProjectName";
               routeBaseName = "project";
            } else {
               throw new AppError("ServerError");
            }

            let userSecret = jwt.sign(
               { _id: user._id, [jwtPayloadName]: metaData.target_name },
               process.env.ORG_JWT_SECRET
            );

            let Hyperlink = `/api/${routeBaseName}/add/new-user/${userSecret}`;
            notificationSnippet = `invited you to join`;

            let invitation = {
               ...payloadBlueprint,
               Hyperlink,
               InfoType: "Invitation",
               ActivityContent: {
                  Action: notificationSnippet,
                  Keyword: metaData.target_name,
               },
            };

            await User.updateOne(
               { _id: user._id },
               {
                  $push: {
                     Notifications: {
                        $each: [invitation],
                        $position: 0,
                     },
                  },
               }
            );
            return res.json({ status: "ok", data: "" });
         }
         case "RequestToJoin": {
            let Hyperlink = null;
            let notificationSnippet = `requested to join the project `;

            let notification = {
               ...payloadBlueprint,
               Hyperlink,
               InfoType: "Request",
               ActivityContent: {
                  Action: notificationSnippet,
                  Keyword: metaData.target_name,
               },
            };
            await User.updateOne(
               { UniqueUsername: req.projectCreator },
               {
                  $push: {
                     Notifications: { $each: [notification], $position: 0 },
                  },
               }
            );
            return res.json({
               status: "ok",
               data: "Requested to join project",
            });
         }
         case "JoinedProject": {
            let notification = {
               ...payloadBlueprint,
               Hyperlink: `/user/profile/${initiator}`,
               InfoType: "New User",
               ActivityContent: {
                  Action: `has joined the project`,
                  Keyword: metaData.target_name,
               },
            };
            await notifyAllInProject(
               initiator,
               metaData.target_name,
               notification
            );

            return res.json({ status: "ok", data: "Joined Project" });
         }
         case "LeaveProjectNotice": {
            let notification = {
               ...payloadBlueprint,
               Hyperlink: `/user/profile/${initiator}`,
               InfoType: `User left project`,
               ActivityContent: {
                  Action: `has left project`,
                  Keyword: metaData.target_name,
               },
            };
            await notifyAllInProject(initiator, recipient, notification);
            return res.json({ status: "ok", data: "Left project" });
         }
         case "NewSolutionLike": {
            let user = await User.findOne({ UniqueUsername: recipient });
            if (!user) throw new AppError("UnauthorizedRequestError");

            if (user.UniqueUsername === initiator)
               throw new AppError("NoActionRequiredError");

            let Hyperlink, notificationSnippet;

            let issue = await Issue.findOne({
               IssueTitle: metaData.target_name,
            });

            Hyperlink = `/issue/${issue._id}`;
            notificationSnippet = `liked your solution to the Issue `;

            let notification = {
               ...payloadBlueprint,
               Hyperlink,
               InfoType: "New like",
               ActivityContent: {
                  Action: notificationSnippet,
                  Keyword: metaData.target_name,
               },
            };

            await User.updateOne(
               { _id: user._id },
               {
                  $push: {
                     Notifications: {
                        $each: [notification],
                        $position: 0,
                     },
                  },
               }
            );
            return res.json({ status: "ok", data: "" });
         }
         case "NewIssue":
         case "NewSolution": {
            let issue = await Issue.findOne({
               IssueTitle: metaData.target_name,
            });

            let Hyperlink = `/issue/${issue._id}`;

            let Action;

            if (metaData.target_category === "Issue")
               Action = `created a new Issue `;

            if (metaData.target_category === "Solution")
               Action = `created a new solution for the Issue `;

            let notification = {
               ...payloadBlueprint,
               Hyperlink,
               InfoType: `New ${metaData.target_category}`,
               ActivityContent: {
                  Action,
                  Keyword: metaData.target_name,
               },
            };

            await notifyAllInProject(initiator, recipient, notification);
            return res.json({ status: "ok", data: "" });
         }
      }
   } catch (error) {
      console.log(error);
      return next(error);
   }
}

module.exports = { handleNotifications };
