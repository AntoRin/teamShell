const jwt = require("jsonwebtoken");
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
      let newOrgData = await org.save();
      await User.updateOne(
         { UniqueUsername, Email },
         {
            $push: {
               Organizations: {
                  _id: newOrgData._id,
                  OrganizationName,
                  Status: "Creator",
               },
            },
         }
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
      if (org === null) throw "Organization not found";
      if (org.Members.includes(UniqueUsername)) {
         return res.json({ status: "ok", Organization: org });
      } else {
         throw "Unauthorized";
      }
   } catch (error) {
      if (error === "Unauthorized")
         return res.status(401).json({ status: "error", error });
      if (error === "Organization not found")
         return res.status(404).json({ status: "error", error });
      return res.status(501).json({ status: "error", error });
   }
});

router.post("/edit", async (req, res) => {
   let { Org, Description } = req.body;

   try {
      await Organization.updateOne({ OrganizationName: Org }, { Description });
      return res.json({ status: "ok" });
   } catch (error) {
      console.log(error);
      return res.json({ status: "error", error });
   }
});

router.get("/add-new-user/:userSecret", async (req, res) => {
   let { UniqueUsername, Email } = req.thisUser;
   let { userSecret } = req.params;

   try {
      let user = await User.findOne({ UniqueUsername, Email });
      if (!user) throw "User not found";
      let { _id, OrganizationName } = jwt.verify(
         userSecret,
         process.env.ORG_JWT_SECRET
      );
      if (_id === user._id.toString()) {
         let checkIsMember = await Organization.findOne({ OrganizationName });
         if (checkIsMember.Members.includes(user.UniqueUsername))
            throw "User Already Present";
         let Org = await Organization.findOneAndUpdate(
            { OrganizationName },
            { $push: { Members: user.UniqueUsername } }
         );
         await User.updateOne(
            { _id: user._id },
            {
               $push: {
                  Organizations: {
                     _id: Org._id,
                     OrganizationName,
                     Status: "Member",
                  },
               },
            }
         );
         return res.redirect(
            `http://localhost:3000/organization/${OrganizationName}`
         );
      } else {
         throw "Invalid User Credentials";
      }
   } catch (error) {
      console.log(error);
      return res.json({ status: "error", error });
   }
});

module.exports = router;
