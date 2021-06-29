import { Document } from "mongoose";
import { messagesType } from "../types";

export interface ProjectChatModel extends Document {
   ProjectName: string;
   Messages: [messagesType];
}
