import { Document, ObjectId } from "mongoose";

export interface ProjectDoc extends Document {
    ProjectName: string;
    ProjectDescription: string;
    ParentOrganization: string;
    InviteOnly: boolean;
    IssuesRef: Array<ObjectId>;
    Creator: string;
    Members: Array<string>;
}