const mongoose = require("mongoose");
const { Schema } = mongoose;

const issueSchema = new Schema(
   {
      Title: {
         type: String,
         required: true,
      },
      IssueDescription: {
         type: String,
         required: true,
      },
      Creator: {
         type: String,
         required: true,
      },
      Comments: {
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

let Issue = mongoose.model("Issue", issueSchema, "Issues");

module.exports = Issue;
