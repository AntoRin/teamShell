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

router.get("/details/:OrganizationName", async (req, res) => {
   let OrganizationName = req.params.OrganizationName;
   let { UniqueUsername, Email } = req.thisUser;

   try {
      let org = await Organization.findOne({ OrganizationName });
      if (org.Members.includes(UniqueUsername)) {
         return res.json({ status: "ok", Organization: org });
      } else {
         throw "Unauthorized";
      }
   } catch (error) {
      if (error === "Unauthorized")
         return res.status(401).json({ status: "error", error });
      return res.status(501).json({ status: "error", error });
   }
});

module.exports = router;
