import mongoose, { Document } from "mongoose";

export type UserNotificationType = {
   Initiator: string;
   NotificationTitle: string;
   NotificationType: string;
   NotificationAction: string;
   NotificationLink: string;
   OtherLinks: Array<{ Name: string; Link: string }>;
   Seen?: boolean;
   createdAt?: Date;
   metaData?: any;
};

type UserIssuesType = {
   Created: Array<{ _id: mongoose.Types.ObjectId; IssueTitle: string }>;
   Bookmarked: Array<{ _id: mongoose.Types.ObjectId; IssueTitle: string }>;
};

export type UserSolutionsType = {
   _id: mongoose.Types.ObjectId;
   IssueContext: {
      _id: mongoose.Types.ObjectId;
      IssueTitle: string;
   };
};

export interface UserModel extends Document {
   UniqueUsername: string;
   Username: string;
   Email: string;
   Password: string;
   AccountType: string;
   GoogleRefreshToken: string;
   Bio: string;
   Notifications: Array<UserNotificationType>;
   Organizations: Array<{
      _id: mongoose.Types.ObjectId;
      OrganizationName: string;
      Status: string;
   }>;
   Projects: Array<{
      _id: mongoose.Types.ObjectId;
      ProjectName: string;
      ParentOrganization: string;
      Status: string;
   }>;
   Issues: UserIssuesType;
   Solutions: Array<UserSolutionsType>;
}
