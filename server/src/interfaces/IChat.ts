import { Document } from "mongoose";
import { messagesType } from "../types";

export interface IChat extends Document {
   ChatID: string;
   Users: Array<string>;
   Messages: [messagesType];
}
