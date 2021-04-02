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
      let { Notifications } = user;
      return res.json({ status: "ok", Notifications });
   } catch (error) {
      console.log(error);
      return res.json({ status: "error", error });
   }
});

router.post("/notifications", async (req, res) => {
   let { newUser, Org } = req.body;

   try {
      let user = await User.findOne({ UniqueUsername: newUser });
      if (!user) throw "User Not Found";
      let userSecret = jwt.sign(
         { _id: user._id, OrganizationName: Org },
         process.env.ORG_JWT_SECRET
      );
      let orgLink = `http://localhost:5000/organization/add-new-user/${userSecret}`;
      await User.updateOne(
         { _id: user._id },
         {
            $push: {
               Notifications: {
                  NotificationType: "Link",
                  NotificationContent: orgLink,
               },
            },
         }
      );
      return res.json({ status: "ok" });
   } catch (error) {
      console.log(error);
      return res.json({ status: "error", error });
   }
});

module.exports = router;
