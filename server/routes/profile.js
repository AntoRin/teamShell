const { Router } = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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

   try {
      switch (metaData.type) {
         case "Invitation":
            let user = await User.findOne({ UniqueUsername: recipient });
            if (!user) throw "User Not Found";

            let payloadBlueprint = {
               NotificationInitiator: initiator,
               NotificationType: "Invitation",
               NotificationCaller: {
                  Category: metaData.invitation_category,
                  Name: metaData.invitation_dest,
                  Info: metaData.caller_info,
               },
            };

            if (metaData.invitation_category === "Organization") {
               let userSecret = jwt.sign(
                  { _id: user._id, OrganizationName: metaData.invitation_dest },
                  process.env.ORG_JWT_SECRET
               );
               let orgLink = `http://localhost:5000/organization/add-new-user/${userSecret}`;
               await User.updateOne(
                  { _id: user._id },
                  {
                     $push: {
                        Notifications: {
                           $each: [
                              {
                                 ...payloadBlueprint,
                                 Hyperlink: orgLink,
                              },
                           ],
                           $position: 0,
                        },
                     },
                  }
               );
               return res.json({ status: "ok", data: "Notification sent" });
            } else if (metaData.invitation_category === "Project") {
               let userSecret = jwt.sign(
                  { _id: user._id, ProjectName: metaData.invitation_dest },
                  process.env.ORG_JWT_SECRET
               );
               let projectLink = `http://localhost:5000/project/add-new-user/${userSecret}`;
               await User.updateOne(
                  { _id: user._id },
                  {
                     $push: {
                        Notifications: {
                           $each: [
                              {
                                 ...payloadBlueprint,
                                 Hyperlink: projectLink,
                              },
                           ],
                           $position: 0,
                        },
                     },
                  }
               );
               return res.json({ status: "ok", data: "Notification sent" });
            }
            break;
      }
   } catch (error) {
      console.log(error);
      return res.status(404).json({ status: "error", error });
   }
});

module.exports = router;
