import { Document } from "mongoose";
import { messagesType } from "../types";

export interface IProjectChat extends Document {
    ProjectName: string;
    Messages: [messagesType];
}