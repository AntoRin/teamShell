const User = require("../models/User");
const Organization = require("../models/Organization");
const { Router } = require("express");
const router = Router();

router.post("/create", async (req, res) => {
   let { UniqueUsername, Email } = req.thisUser;
   let { OrganizationName, Description } = req.body;

   let org = new Organization({
      OrganizationName,
      Description,
      Creator: UniqueUsername,
      Members: [UniqueUsername],
   });

   try {
      await org.save();
      await User.updateOne(
         { UniqueUsername, Email },
         { $push: { Organizations: { OrganizationName, Status: "Creator" } } }
      );
      return res.json({ status: "ok" });
   } catch (error) {
      console.log(error);
      res.status(401).json({ status: "error", error });
   }
});

module.exports = router;
