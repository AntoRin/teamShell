import { Document, ObjectId } from "mongoose";

export type userNotification = {
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

type userIssues = {
   Created: Array<{ _id: ObjectId; IssueTitle: string }>;
   Bookmarked: Array<{ _id: ObjectId; IssueTitle: string }>;
};

export type userSolutions = {
   _id?: ObjectId;
   IssueContext: {
      _id: ObjectId;
      IssueTitle: string;
   };
};

export interface IUser extends Document {
   UniqueUsername: string;
   Username: string;
   Email: string;
   Password: string;
   AccountType: string;
   GoogleRefreshToken: string;
   Bio: string;
   Notifications: [userNotification];
   Organizations: Array<{
      _id: ObjectId;
      OrganizationName: string;
      Status: string;
   }>;
   Projects: Array<{
      _id: ObjectId;
      ProjectName: string;
      ParentOrganization: string;
      Status: string;
   }>;
   Issues: userIssues;
   Solutions: Array<userSolutions>;
}
