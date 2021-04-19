const mongoose = require("mongoose");
const { Schema } = mongoose;

const issueSchema = new Schema(
   {
      IssueTitle: {
         type: String,
         required: true,
      },
      IssueDescription: {
         type: String,
         required: true,
      },
      ProjectContext: {
         type: String,
         required: true,
      },
      Project_id: {
         type: String,
         required: true,
      },
      Creator: {
         type: {
            UniqueUsername: { type: String, required: true },
            User_id: { type: String, required: true },
            ProfileImage: { type: String, required: true },
         },
         required: true,
      },
      Solutions: {
         type: [
            {
               CommentBy: {
                  type: String,
                  required: true,
               },
               CommentBody: {
                  type: String,
                  required: true,
               },
               createdAt: {
                  type: Date,
                  default: Date.now,
               },
            },
         ],
         default: [],
      },
      Follows: {
         type: [
            {
               FollowedBy: {
                  type: String,
                  required: true,
               },
            },
         ],
         default: [],
      },
   },
   { timestamps: true }
);

module.exports = issueSchema;
