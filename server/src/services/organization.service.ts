import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import { UserNotificationType } from "../interfaces/UserModel";
import Organization from "../models/Organization";
import User from "../models/User";
import { AuthenticatedRequest, RequestUserType } from "../types";
import AppError from "../utils/AppError";
import { OrganizationModel } from "../interfaces/OrganizationModel";
import Project from "../models/Project";
import { ThrowsServiceException } from "../decorators/ServiceException";
import { Component } from "express-frills";

@Component()
export class OrganizationService {
   public constructor() {}

   @ThrowsServiceException
   public async createNewOrganization(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername, Email } = req.thisUser as RequestUserType;
      const { OrganizationName, Description }: { OrganizationName: string; Description: string } = req.body;

      const org = new Organization({
         OrganizationName,
         Description,
         Creator: UniqueUsername,
         Members: [UniqueUsername],
      });

      const newOrgData = await org.save();

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
   }

   @ThrowsServiceException
   public async getSingleOrganization(req: AuthenticatedRequest, res: Response) {
      const OrganizationName = req.params.OrganizationName;

      const org = await Organization.findOne({ OrganizationName }).lean();

      if (!org) throw new AppError("BadRequestError");

      return res.json({ status: "ok", Organization: org });
   }

   @ThrowsServiceException
   public async editOrganization(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const { Org, Description, Public } = req.body;

      const organization = await Organization.findOne({
         OrganizationName: Org,
      });

      if (!organization) throw new AppError("BadRequestError");

      if (organization.Creator !== UniqueUsername) throw new AppError("UnauthorizedRequestError");

      await Organization.updateOne({ OrganizationName: Org }, { $set: { Description, Public } });
      return res.json({ status: "ok", data: "" });
   }

   @ThrowsServiceException
   public async inviteUserToOrganization(req: AuthenticatedRequest, _: Response, next: NextFunction) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const { recipient, organizationName } = req.body;

      const org = await Organization.findOne({
         OrganizationName: organizationName,
      }).lean();

      if (!org) throw new AppError("BadRequestError");

      if (org.Creator !== UniqueUsername) throw new AppError("UnauthorizedRequestError");

      const recipientData = await User.findOne({
         UniqueUsername: recipient,
      }).lean();

      if (!recipientData) throw new AppError("UnauthorizedRequestError");

      const invitationSecret = jwt.sign(
         { _id: recipientData._id, OrganizationName: org.OrganizationName },
         process.env.ORG_JWT_SECRET
      );

      const inviteLink = `/api/organization/add/new-user/${invitationSecret}`;

      const notification: UserNotificationType = {
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
   }

   @ThrowsServiceException
   public async addUserToOrganizationWithUserSecret(req: AuthenticatedRequest, _: Response, next: NextFunction) {
      const { UniqueUsername, Email } = req.thisUser as RequestUserType;
      const { userSecret } = req.params;

      const user = await User.findOne({ UniqueUsername, Email });
      if (!user) throw new AppError("UnauthorizedRequestError");

      const { _id, OrganizationName } = jwt.verify(userSecret, process.env.ORG_JWT_SECRET) as any;

      if (_id === user._id.toString()) {
         const checkIsMember = await Organization.findOne({
            OrganizationName,
         });
         if (checkIsMember?.Members.includes(user.UniqueUsername)) throw new AppError("OrgInvitationReboundError");
         const Org = await Organization.findOneAndUpdate({ OrganizationName }, { $push: { Members: user.UniqueUsername } });
         await User.updateOne(
            { _id: user._id },
            {
               $push: {
                  Organizations: {
                     _id: Org!._id,
                     OrganizationName,
                     Status: "Member",
                  },
               },
            }
         );

         const notification: UserNotificationType = {
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
   }

   @ThrowsServiceException
   public async sendJoinRequestToOrganization(req: AuthenticatedRequest, _: Response, next: NextFunction) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const { organizationName } = req.params;

      const org = await Organization.findOne({
         OrganizationName: organizationName,
      }).lean();

      if (!org) throw new AppError("BadRequestError");

      if (org.Members.includes(UniqueUsername)) throw new AppError("OrgInvitationReboundError");

      if (!org.Public) throw new AppError("UnauthorizedRequestError");

      const notification: UserNotificationType = {
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
   }

   @ThrowsServiceException
   public async acceptUserToOrganization(req: AuthenticatedRequest, _: Response, next: NextFunction) {
      const { newUser, requestedOrganization } = req.query as {
         newUser: string;
         requestedOrganization: string;
      };
      const { UniqueUsername } = req.thisUser as RequestUserType;

      const org = await Organization.findOne({
         OrganizationName: requestedOrganization,
      });

      if (!org) throw new AppError("BadRequestError");

      if (org.Creator !== UniqueUsername) throw new AppError("UnauthorizedRequestError");

      if (org.Members.includes(newUser)) throw new AppError("OrgInvitationReboundError");

      const updatedOrganization = (await Organization.findOneAndUpdate(
         { OrganizationName: org.OrganizationName },
         { $push: { Members: { $each: [newUser], $position: 0 } } }
      )) as OrganizationModel;

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

      const notification1: UserNotificationType = {
         Initiator: UniqueUsername,
         NotificationTitle: "",
         NotificationAction: `accepted your request to join the organization ${org.OrganizationName}`,
         NotificationType: "Standard",
         NotificationLink: `/organization/${org.OrganizationName}`,
         OtherLinks: [],
         metaData: {
            recipientType: "SingleUser",
            recipient: newUser,
         },
      };

      const notification2: UserNotificationType = {
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
   }

   @ThrowsServiceException
   public async leaveOrganization(req: AuthenticatedRequest, _: Response, next: NextFunction) {
      const { UniqueUsername, Email } = req.thisUser as RequestUserType;
      const organizationName = req.params.organizationName;

      const user = await User.findOne({ UniqueUsername, Email }).lean();

      if (!user) throw new AppError("ServerError");

      const userInOrg = user?.Organizations.find(org => org.OrganizationName === organizationName);

      if (!userInOrg) throw new AppError("NoActionRequiredError");

      if (userInOrg.Status === "Creator") throw new AppError("IrrevertibleActionError");

      await User.updateOne({ UniqueUsername, Email }, { $pull: { Organizations: { OrganizationName: organizationName } } });

      await User.updateOne(
         { UniqueUsername, Email },
         {
            $pull: { Projects: { ParentOrganization: organizationName } },
         }
      );

      await Organization.updateOne({ OrganizationName: organizationName }, { $pull: { Members: UniqueUsername } });

      await Project.updateMany(
         { Members: UniqueUsername },
         {
            $pull: { Members: UniqueUsername },
         }
      );

      const notification: UserNotificationType = {
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
   }

   @ThrowsServiceException
   public async getExplorerData(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername } = req.thisUser as RequestUserType;

      const orgs = await Organization.find({
         Members: { $ne: UniqueUsername },
      });

      return res.json({
         status: "ok",
         data: {
            exploreOrganizations: orgs,
         },
      });
   }
}
