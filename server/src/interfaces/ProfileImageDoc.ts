import { Document } from "mongoose";

export interface ProfileImageDoc extends Document {
    UserContext: string;
    ImageData: string;
}