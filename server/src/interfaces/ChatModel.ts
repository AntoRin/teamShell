import { Document } from "mongoose";
import { MessagesType } from "../types";

export interface ChatModel extends Document {
   ChatID: string;
   Users: string[];
   Messages: [MessagesType];
}
