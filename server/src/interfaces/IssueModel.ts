import { Document, ObjectId } from "mongoose";

export type issueSolutions = {
   _id?: ObjectId;
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
   Solutions: Array<issueSolutions>;
   createdAt?: Date;
}
