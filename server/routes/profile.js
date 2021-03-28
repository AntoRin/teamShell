const { Router } = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const isLoggedIn = require("../utils/isLoggedIn");

const router = Router();

router.get("/:UniqueUsername", async (req, res) => {
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

module.exports = router;
