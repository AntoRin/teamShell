import { Document, ObjectId } from "mongoose";

export interface OrganizationModel extends Document {
   _id: ObjectId;
   OrganizationName: string;
   Description: string;
   Creator: string;
   Members: Array<string>;
   Projects: Array<string>;
   Public: boolean;
}
