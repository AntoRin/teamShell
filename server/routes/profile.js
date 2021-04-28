const { Router } = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Project = require("../models/Project");

const router = Router();

router.get("/details/:UniqueUsername", async (req, res) => {
   let requestedUser = req.params.UniqueUsername;

   try {
      let { _doc } = await User.findOne({
         UniqueUsername: requestedUser,
      });
      let { Password, _id, ...user } = _doc;
      if (user) return res.json({ status: "ok", user });
      else throw "User not found";
   } catch (error) {
      return res.status(401).json({ status: "error", error: error.message });
   }
});

router.put("/edit", async (req, res) => {
   let { Bio, Username } = req.body;
   let { UniqueUsername, Email } = req.thisUser;

   try {
      await User.updateOne({ UniqueUsername, Email }, { Bio, Username });
      res.json({ status: "ok", message: "Profile Updated" });
   } catch (error) {
      res.status(501).json({ status: "error", error });
   }
});

router.get("/notifications", async (req, res) => {
   let { UniqueUsername, Email } = req.thisUser;

   try {
      let user = await User.findOne({ UniqueUsername, Email });
      if (!user) throw "User Not Found";
      let { Notifications } = user;
      return res.json({ status: "ok", data: { Notifications } });
   } catch (error) {
      console.log(error);
      return res.json({ status: "error", error });
   }
});

router.get("/notifications/clear", async (req, res) => {
   let { UniqueUsername, Email } = req.thisUser;

   try {
      await User.updateOne({ UniqueUsername, Email }, { Notifications: [] });
      return res.json({ status: "ok" });
   } catch (error) {
      console.log(error);
      return res.json({ status: error, error });
   }
});

router.post("/notifications", async (req, res) => {
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
      switch (metaData.info_type) {
         case "Invitation":
            let user = await User.findOne({ UniqueUsername: recipient });
            if (!user) throw "User Not Found";

            let jwtPayloadName, routeBaseName;

            if (metaData.target_category === "Organization") {
               jwtPayloadName = "OrganizationName";
               routeBaseName = "organization";
            } else if (metaData.target_category === "Project") {
               jwtPayloadName = "ProjectName";
               routeBaseName = "project";
            } else {
               throw "Internal Error";
            }

            let userSecret = jwt.sign(
               { _id: user._id, [jwtPayloadName]: metaData.target_name },
               process.env.ORG_JWT_SECRET
            );

            let invitationLink = `http://localhost:5000/${routeBaseName}/add-new-user/${userSecret}`;

            let invitation = {
               ...payloadBlueprint,
               Hyperlink: invitationLink,
               ActivityContent: {
                  Action: "has invited you to join",
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
         case "Update_Group":
            let issueQuery = await Project.findOne(
               { "Issues.IssueTitle": metaData.target_name },
               {
                  Issues: { $elemMatch: { IssueTitle: metaData.target_name } },
                  _id: 0,
               }
            );

            let issue = issueQuery.Issues[0];

            let newIssueLink = `http://localhost:3000/issue/${issue._id}`;

            let notification = {
               ...payloadBlueprint,
               Hyperlink: newIssueLink,
               ActivityContent: {
                  Action: "has created a new issue:",
                  Keyword: metaData.target_name,
               },
            };

            await User.updateMany(
               { "Projects.ProjectName": recipient },
               {
                  $push: {
                     Notifications: { $each: [notification], $position: 0 },
                  },
               }
            );
      }
   } catch (error) {
      console.log(error);
      return res.status(404).json({ status: "error", error });
   }
});

module.exports = router;
