const mongoose = require("mongoose");
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
      Bio: {
         type: String,
         default: "",
      },
      Notifications: {
         type: [
            {
               Initiator: {
                  type: {
                     UniqueUsername: String,
                  },
                  required: true,
               },
               InfoType: {
                  type: String,
                  required: true,
               },
               Target: {
                  type: {
                     Category: String,
                     Name: String,
                     Info: String,
                  },
               },
               ActivityContent: {
                  type: {
                     Action: { type: String, required: true },
                     Keyword: { type: String, required: true },
                  },
               },
               Hyperlink: {
                  type: String,
                  required: true,
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

const User = mongoose.model("User", UserSchema, "Users");

module.exports = User;
