import mongoose, { Document } from "mongoose";

export interface OrganizationModel extends Document {
   _id: mongoose.Types.ObjectId;
   OrganizationName: string;
   Description: string;
   Creator: string;
   Members: Array<string>;
   Projects: Array<string>;
   Public: boolean;
}
