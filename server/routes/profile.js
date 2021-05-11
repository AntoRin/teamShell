const { Router } = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Project = require("../models/Project");
const multer = require("multer");
const fsPromises = require("fs/promises");
const path = require("path");

const router = Router();

const upload = multer({
   storage: multer.memoryStorage(),
   fileFilter: (req, file, cb) => {
      if (!file || file.mimetype.split("/")[0] !== "image")
         cb(new Error("Error parsing file"), false);
      else cb(null, true);
   },
});
const imageParser = upload.single("profileImage");

router.get("/details/:UniqueUsername", async (req, res, next) => {
   let requestedUser = req.params.UniqueUsername;

   try {
      let { _doc } = await User.findOne({
         UniqueUsername: requestedUser,
      });
      let { Password, _id, ...user } = _doc;
      if (user) return res.json({ status: "ok", user });
      else throw { name: "UnknownData" };
   } catch (error) {
      return next(error);
   }
});

router.put("/edit", async (req, res, next) => {
   let { Bio, Username } = req.body;
   let { UniqueUsername, Email } = req.thisUser;

   try {
      await User.updateOne({ UniqueUsername, Email }, { Bio, Username });
      res.json({ status: "ok", message: "Profile Updated" });
   } catch (error) {
      return next(error);
   }
});

router.post("/uploads/profile-image", imageParser, async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;
   try {
      let file = req.file;

      if (!file) throw { name: "UploadFailure" };

      let buffer = file.buffer;

      await User.updateOne({ UniqueUsername, Email }, { ProfileImage: buffer });

      return res.json({ status: "ok", data: "Image Uploaded" });
   } catch (error) {
      return next(error);
   }
});

router.get("/notifications", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;

   try {
      let user = await User.findOne({ UniqueUsername, Email });
      if (!user) throw { name: "UnauthorizedRequest" };
      let { Notifications } = user;
      return res.json({ status: "ok", data: { Notifications } });
   } catch (error) {
      return next(error);
   }
});

router.post("/notifications", async (req, res, next) => {
   let { initiator, recipient, metaData } = req.body;

   let payloadBlueprint = {
      Initiator: initiator,
      InfoType: metaData.info_type,
      Target: {
         Category: metaData.target_category,
         Name: metaData.target_name,
         Info: metaData.target_info,
      },
   };

   try {
      switch (metaData.notification_type) {
         case "User":
            let user = await User.findOne({ UniqueUsername: recipient });
            if (!user) throw { name: "UnauthorizedRequest" };

            if (user.UniqueUsername === initiator.UniqueUsername)
               throw { name: "SilentEnd" };

            let userPersonalLink, notificationSnippet;

            if (
               metaData.target_category === "Issue" ||
               metaData.target_category === "Solution"
            ) {
               let issueQuery = await Project.findOne(
                  { "Issues.IssueTitle": metaData.target_name },
                  {
                     Issues: {
                        $elemMatch: { IssueTitle: metaData.target_name },
                     },
                     _id: 0,
                  }
               );

               let issue = issueQuery.Issues[0];

               userPersonalLink = `/issue/${issue._id}`;
               notificationSnippet = `${metaData.initiator_opinion} your solution.`;
            } else {
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

               userPersonalLink = `/${routeBaseName}/add/new-user/${userSecret}`;
               notificationSnippet = `${metaData.initiator_opinion} you to join`;
            }

            let invitation = {
               ...payloadBlueprint,
               Hyperlink: userPersonalLink,
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
            return res.json({ status: "ok", data: "Notification sent" });
            break;
         case "Group":
            let issueQuery = await Project.findOne(
               { "Issues.IssueTitle": metaData.target_name },
               {
                  Issues: { $elemMatch: { IssueTitle: metaData.target_name } },
                  _id: 0,
               }
            );

            let issue = issueQuery.Issues[0];

            let groupLink = `/issue/${issue._id}`;

            let notification = {
               ...payloadBlueprint,
               Hyperlink: groupLink,
               ActivityContent: {
                  Action: `${metaData.initiator_opinion} a new ${metaData.target_category}:`,
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
      }
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.get("/notifications/seen", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;

   try {
      await User.updateOne(
         { UniqueUsername, Email, "Notifications.Seen": false },
         { $set: { "Notifications.$[].Seen": true } },
         { multi: true }
      );
      return res.json({ status: "ok", data: "" });
   } catch (error) {
      console.log(error);
      next(error);
   }
});

router.get("/search", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;
   let query = req.query.user;

   try {
      let aggregrationPipeline = [
         {
            $match: {
               UniqueUsername: `${UniqueUsername}`,
            },
         },
         {
            $lookup: {
               from: "Organizations",
               localField: "Organizations.OrganizationName",
               foreignField: "OrganizationName",
               as: "SameOrg",
            },
         },
         {
            $lookup: {
               from: "Users",
               localField: "SameOrg.Members",
               foreignField: "UniqueUsername",
               as: "MembersOfSameOrg",
            },
         },
         {
            $project: {
               "MembersOfSameOrg.UniqueUsername": 1,
            },
         },
      ];

      let sameOrgAggregation = await User.aggregate(aggregrationPipeline);
      let { MembersOfSameOrg } = sameOrgAggregation[0];

      let search = await User.find({ $text: { $search: query } });
      let searchData = ["Not found"];

      if (search.length > 0) {
         searchData = search.map(resultUser => {
            let commonOrg = MembersOfSameOrg.some(
               member =>
                  resultUser.UniqueUsername === member.UniqueUsername &&
                  resultUser.UniqueUsername !== UniqueUsername
            );

            return commonOrg ? resultUser.UniqueUsername : "";
         });
      }
      return res.json({ status: "ok", data: searchData });
   } catch (error) {
      return next(error);
   }
});

module.exports = router;
