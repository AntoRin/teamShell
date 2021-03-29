const { Router } = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const isLoggedIn = require("../utils/isLoggedIn");

const router = Router();

router.get("/details/:UniqueUsername", async (req, res) => {
   let requestedUser = req.params.UniqueUsername;

   try {
      let loggedInStatus = await isLoggedIn(req.cookies.token);
      if (loggedInStatus instanceof Error) throw loggedInStatus;
      let user = await User.findOne({ UniqueUsername: requestedUser });
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

module.exports = router;
