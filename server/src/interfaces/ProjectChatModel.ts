import { Document } from "mongoose";
import { MessagesType } from "../types";

export interface ProjectChatModel extends Document {
   ProjectName: string;
   Messages: [MessagesType];
}
