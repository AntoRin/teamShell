const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { Router } = require("express");
const { handleNotifications } = require("../utils/notificationHandler");
const router = Router();

const AppError = require("../utils/AppError");

router.post("/create", async (req, res, next) => {
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
                  $each: [
                     {
                        _id: newOrgData._id,
                        OrganizationName,
                        Status: "Creator",
                     },
                  ],
                  $position: 0,
               },
            },
         }
      );
      return res.json({ status: "ok" });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.get("/details/:OrganizationName", async (req, res, next) => {
   let OrganizationName = req.params.OrganizationName;
   let { UniqueUsername, Email } = req.thisUser;

   try {
      let org = await Organization.findOne({ OrganizationName });
      if (org === null) throw new AppError("BadRequestError");
      if (org.Members.includes(UniqueUsername)) {
         return res.json({ status: "ok", Organization: org });
      } else {
         throw new AppError("UnauthorizedRequestError");
      }
   } catch (error) {
      return next(error);
   }
});

router.post("/edit", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { Org, Description } = req.body;

   try {
      let organization = await Organization.findOne({ OrganizationName: Org });

      if (!organization) throw new AppError("BadRequestError");
      if (organization.Creator !== UniqueUsername)
         throw new AppError("UnauthorizedRequestError");

      await Organization.updateOne({ OrganizationName: Org }, { Description });
      return res.json({ status: "ok", data: "" });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.post("/invite/new-user", handleNotifications);

router.get("/add/new-user/:userSecret", async (req, res, next) => {
   let { UniqueUsername, Email } = req.thisUser;
   let { userSecret } = req.params;

   try {
      let user = await User.findOne({ UniqueUsername, Email });
      if (!user) throw new AppError("UnauthorizedRequestError");
      let { _id, OrganizationName } = jwt.verify(
         userSecret,
         process.env.ORG_JWT_SECRET
      );
      if (_id === user._id.toString()) {
         let checkIsMember = await Organization.findOne({ OrganizationName });
         if (checkIsMember.Members.includes(user.UniqueUsername))
            throw new AppError("OrgInvitationReboundError");
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
         return res.redirect(`/organization/${OrganizationName}`);
      } else {
         throw new AppError("AuthenticationError");
      }
   } catch (error) {
      return next(error);
   }
});

module.exports = router;
