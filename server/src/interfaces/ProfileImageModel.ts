import { Document } from "mongoose";

export interface ProfileImageModel extends Document {
   UserContext: string;
   ImageData: string;
}
