const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { Router } = require("express");
const { handleNotifications } = require("../utils/notificationHandler");
const router = Router();

const AppError = require("../utils/AppError");
const Project = require("../models/Project");

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
      let org = await Organization.findOne({ OrganizationName }).lean();

      if (!org) throw new AppError("BadRequestError");

      return res.json({ status: "ok", Organization: org });
   } catch (error) {
      return next(error);
   }
});

router.post("/edit", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { Org, Description, Public } = req.body;

   try {
      let organization = await Organization.findOne({ OrganizationName: Org });

      if (!organization) throw new AppError("BadRequestError");

      if (organization.Creator !== UniqueUsername)
         throw new AppError("UnauthorizedRequestError");

      await Organization.updateOne(
         { OrganizationName: Org },
         { $set: { Description, Public } }
      );
      return res.json({ status: "ok", data: "" });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.post(
   "/invite/new-user",
   async (req, res, next) => {
      let { UniqueUsername } = req.thisUser;
      let { recipient, organizationName } = req.body;

      try {
         let org = await Organization.findOne({
            OrganizationName: organizationName,
         }).lean();

         if (!org) throw new AppError("BadRequestError");

         if (org.Creator !== UniqueUsername)
            throw new AppError("UnauthorizedRequestError");

         let recipientData = await User.findOne({
            UniqueUsername: recipient,
         }).lean();

         if (!recipientData) throw new AppError("UnauthorizedRequestError");

         let invitationSecret = jwt.sign(
            { _id: recipientData._id, OrganizationName: org.OrganizationName },
            process.env.ORG_JWT_SECRET
         );

         let inviteLink = `/api/organization/add/new-user/${invitationSecret}`;

         let notification = {
            Initiator: UniqueUsername,
            NotificationTitle: "Invitation",
            NotificationType: "Invitation",
            NotificationLink: inviteLink,
            NotificationAction: `invited you to join the organization ${org.OrganizationName}`,
            OtherLinks: [
               {
                  Name: "Organization",
                  Link: `/organization/${org.OrganizationName}`,
               },
            ],
            metaData: {
               recipientType: "SingleUser",
               recipient,
            },
         };

         req.notifications = [notification];

         return next();
      } catch (error) {
         return next(error);
      }
   },
   handleNotifications
);

router.get(
   "/add/new-user/:userSecret",
   async (req, res, next) => {
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
            let checkIsMember = await Organization.findOne({
               OrganizationName,
            });
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

            let notification = {
               Initiator: UniqueUsername,
               NotificationTitle: "New User",
               NotificationType: "Standard",
               NotificationAction: `joined the organization ${OrganizationName}`,
               NotificationLink: `/organization/${OrganizationName}`,
               OtherLinks: [],
               metaData: {
                  recipientType: "Group",
                  groupType: "Organization",
                  recipient: OrganizationName,
                  successMessage: { url: `/organization/${OrganizationName}` },
               },
            };

            req.notifications = [notification];

            return next();
         } else {
            throw new AppError("AuthenticationError");
         }
      } catch (error) {
         return next(error);
      }
   },
   handleNotifications
);

router.get(
   "/join-request/:organizationName",
   async (req, res, next) => {
      let { UniqueUsername } = req.thisUser;
      let { organizationName } = req.params;

      try {
         let org = await Organization.findOne({
            OrganizationName: organizationName,
         }).lean();

         if (!org) throw new AppError("BadRequestError");

         if (org.Members.includes(UniqueUsername))
            throw new AppError("OrgInvitationReboundError");

         if (!org.Public) throw new AppError("UnauthorizedRequestError");

         let notification = {
            Initiator: UniqueUsername,
            NotificationTitle: "Request",
            NotificationType: "Request",
            NotificationLink: `/api/organization/accept/new-user?newUser=${UniqueUsername}&requestedOrganization=${org.OrganizationName}`,
            OtherLinks: [],
            NotificationAction: `requested to join the organization ${org.OrganizationName}`,
            metaData: {
               recipientType: "SingleUser",
               recipient: org.Creator,
            },
         };

         req.notifications = [notification];

         return next();
      } catch (error) {
         return next(error);
      }
   },
   handleNotifications
);

router.get(
   "/accept/new-user",
   async (req, res, next) => {
      let { newUser, requestedOrganization } = req.query;
      let { UniqueUsername } = req.thisUser;

      try {
         let org = await Organization.findOne({
            OrganizationName: requestedOrganization,
         });

         if (!org) throw new AppError("BadRequestError");

         if (org.Creator !== UniqueUsername)
            throw new AppError("UnauthorizedRequestError");

         if (org.Members.includes(newUser))
            throw new AppError("OrgInvitationReboundError");

         let updatedOrganization = await Organization.findOneAndUpdate(
            { OrganizationName: org.OrganizationName },
            { $push: { Members: { $each: [newUser], $position: 0 } } }
         );
         await User.updateOne(
            { UniqueUsername: newUser },
            {
               $push: {
                  Organizations: {
                     $each: [
                        {
                           _id: updatedOrganization._id,
                           OrganizationName: org.OrganizationName,
                           Status: "Member",
                        },
                     ],
                     $position: 0,
                  },
               },
            }
         );

         let notification1 = {
            Initiator: UniqueUsername,
            NotificationTitle: "",
            NotificationAction: `accepted your request to join the organization ${org.OrganizationName}`,
            NotificationLink: `/organization/${org.OrganizationName}`,
            OtherLinks: [],
            metaData: {
               recipientType: "SingleUser",
               recipient: newUser,
            },
         };

         let notification2 = {
            Initiator: newUser,
            NotificationTitle: "New User",
            NotificationType: "Standard",
            NotificationAction: `joined the organization ${org.OrganizationName}`,
            NotificationLink: `/organization/${org.OrganizationName}`,
            OtherLinks: [],
            metaData: {
               recipientType: "Group",
               groupType: "Organization",
               recipient: org.OrganizationName,
            },
         };

         req.notifications = [notification1, notification2];

         return next();
      } catch (error) {
         return next(error);
      }
   },
   handleNotifications
);

router.get(
   "/leave/:organizationName",
   async (req, res, next) => {
      let { UniqueUsername, Email } = req.thisUser;
      let organizationName = req.params.organizationName;

      try {
         let user = await User.findOne({ UniqueUsername, Email }).lean();

         let userInOrg = user.Organizations.find(
            org => org.OrganizationName === organizationName
         );

         if (!userInOrg) throw new AppError("NoActionRequiredError");

         if (userInOrg.Status === "Creator")
            throw new AppError("IrrevertibleActionError");

         await User.updateOne(
            { UniqueUsername, Email },
            { $pull: { Organizations: { OrganizationName: organizationName } } }
         );

         await User.updateOne(
            { UniqueUsername, Email },
            {
               $pull: { Projects: { ParentOrganization: organizationName } },
            }
         );

         await Organization.updateOne(
            { OrganizationName: organizationName },
            { $pull: { Members: UniqueUsername } }
         );

         await Project.updateMany(
            { Members: UniqueUsername },
            {
               $pull: { Members: UniqueUsername },
            }
         );

         let notification = {
            Initiator: UniqueUsername,
            NotificationTitle: "",
            NotificationType: "Standard",
            NotificationLink: `/user/profile/${UniqueUsername}`,
            OtherLinks: [],
            NotificationAction: `left the organization ${organizationName}`,
            metaData: {
               recipientType: "Group",
               groupType: "Organization",
               recipient: organizationName,
            },
         };

         req.notifications = [notification];

         return next();
      } catch (error) {
         return next(error);
      }
   },
   handleNotifications
);

module.exports = router;
