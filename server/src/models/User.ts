import mongoose from "mongoose";
import { UserModel } from "../interfaces/UserModel";
const { Schema } = mongoose;

const UserSchema = new Schema(
   {
      UniqueUsername: {
         type: String,
         required: true,
         unique: true,
      },
      Username: {
         type: String,
         default: "",
      },
      Email: {
         type: String,
         required: true,
         unique: true,
      },
      Password: {
         type: String,
         required: true,
      },
      AccountType: {
         type: String,
         required: true,
      },
      GoogleRefreshToken: {
         type: String,
      },
      Bio: {
         type: String,
         default: "",
      },
      Notifications: {
         type: [
            {
               Initiator: {
                  type: String,
                  required: true,
               },
               NotificationTitle: {
                  type: String,
                  required: true,
               },
               NotificationType: {
                  type: String,
                  required: true,
               },
               NotificationAction: {
                  type: String,
                  required: true,
               },
               NotificationLink: {
                  type: String,
                  required: true,
               },
               OtherLinks: {
                  type: [
                     {
                        Name: String,
                        Link: String,
                     },
                  ],
               },
               Seen: {
                  type: Boolean,
                  required: true,
                  default: false,
               },
               createdAt: {
                  type: Date,
                  default: Date.now,
               },
            },
         ],
         default: [],
      },
      Organizations: {
         type: [
            {
               OrganizationName: { type: String, required: true },
               Status: { type: String, required: true },
            },
         ],
         default: [],
      },
      Projects: {
         type: [
            {
               ProjectName: { type: String, required: true },
               ParentOrganization: { type: String, required: true },
               Status: { type: String, required: true },
            },
         ],
         default: [],
      },
      Issues: {
         type: {
            Created: {
               type: [
                  {
                     IssueTitle: { type: String, required: true },
                  },
               ],
               default: [],
            },
            Bookmarked: {
               type: [
                  {
                     IssueTitle: { type: String, required: true },
                  },
               ],
               default: [],
            },
         },
         default: {
            Created: [],
            Bookmarked: [],
         },
      },
      Solutions: {
         type: [
            {
               _id: { type: mongoose.Types.ObjectId, required: true },
               IssueContext: {
                  type: {
                     _id: mongoose.Types.ObjectId,
                     IssueTitle: String,
                  },
                  required: true,
               },
            },
         ],
         default: [],
      },
   },
   { timestamps: true, strictQuery: "throw" }
);

const User = mongoose.model<UserModel>("User", UserSchema, "Users");

export default User;
