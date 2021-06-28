import mongoose from "mongoose";
import { IssueDoc } from "../interfaces/IssueDoc";
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
      Active: {
         type: Boolean,
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
         },
         required: true,
      },
      Solutions: {
         type: [
            {
               SolutionCreator: {
                  type: String,
                  required: true,
               },
               SolutionBody: {
                  type: String,
                  required: true,
               },
               LikedBy: {
                  type: [
                     {
                        _id: { type: mongoose.Types.ObjectId, required: true },
                        UniqueUsername: { type: String, required: true },
                     },
                  ],
               },
               createdAt: {
                  type: Date,
                  default: Date.now,
               },
            },
         ],
         default: [],
      },
   },
   { timestamps: true, strictQuery: "throw" }
);

const Issue = mongoose.model<IssueDoc>("Issues", issueSchema, "Issues");

export default Issue;
