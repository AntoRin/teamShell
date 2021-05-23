const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Issue = require("../models/Issue");

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
            if (!user) throw { name: "UnauthorizedRequest" };

            let jwtPayloadName, routeBaseName;

            if (metaData.target_category === "Organization") {
               jwtPayloadName = "OrganizationName";
               routeBaseName = "organization";
            } else if (metaData.target_category === "Project") {
               jwtPayloadName = "ProjectName";
               routeBaseName = "project";
            } else {
               throw { name: "ServerError" };
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
         case "RequestToJoin":
            {
               let Hyperlink = `/user/profile/${initiator.UniqueUsername}`;
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
               console.log("hoihoinoinoininoinon");
               await User.updateOne(
                  { UniqueUsername: req.projectCreator },
                  {
                     $push: {
                        Notifications: { $each: [notification], $position: 0 },
                     },
                  }
               );
            }
            return res.json({ status: "ok", data: "" });
         case "NewSolutionLike": {
            let user = await User.findOne({ UniqueUsername: recipient });
            if (!user) throw { name: "UnauthorizedRequest" };

            if (user.UniqueUsername === initiator.UniqueUsername)
               throw { name: "SilentEnd" };

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

            await User.updateMany(
               {
                  "Projects.ProjectName": recipient,
                  UniqueUsername: { $ne: initiator.UniqueUsername },
               },
               {
                  $push: {
                     Notifications: { $each: [notification], $position: 0 },
                  },
               }
            );
            return res.json({ status: "ok", data: "" });
         }
      }
   } catch (error) {
      console.log(error);
      return next(error);
   }
}

module.exports = { handleNotifications };
