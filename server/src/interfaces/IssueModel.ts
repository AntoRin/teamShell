import mongoose, { Document, ObjectId } from "mongoose";

export type IssueSolutionType = {
   _id: mongoose.Types.ObjectId;
   SolutionCreator: string;
   SolutionBody: string;
   LikedBy?: Array<{ _id: ObjectId; UniqueUsername: string }>;
   createdAt?: Date;
};

export interface IssueModel extends Document {
   IssueTitle: string;
   IssueDescription: string;
   Active: boolean;
   ProjectContext: string;
   Project_id: string;
   Creator: { UniqueUsername: string; User_id: string };
   Solutions: Array<IssueSolutionType>;
   createdAt?: Date;
}
