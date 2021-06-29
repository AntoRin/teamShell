import { Document } from "mongoose";
import { MessagesType } from "../types";

export interface ChatModel extends Document {
   ChatID: string;
   Users: Array<string>;
   Messages: [MessagesType];
}
