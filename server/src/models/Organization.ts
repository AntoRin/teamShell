import mongoose from "mongoose";
import { OrganizationModel } from "../interfaces/OrganizationModel";
const { Schema } = mongoose;

const OrganizationSchema = new Schema(
   {
      OrganizationName: {
         type: String,
         required: true,
         unique: true,
      },
      Description: {
         type: String,
         required: true,
      },
      Creator: {
         type: String,
         required: true,
      },
      Members: {
         type: Array,
         default: [],
         required: true,
      },
      Projects: {
         type: Array,
         default: [],
      },
      Public: {
         type: Boolean,
         default: false,
      },
   },
   { timestamps: true, strictQuery: "throw" }
);

const Organization = mongoose.model<OrganizationModel>(
   "Organization",
   OrganizationSchema,
   "Organizations"
);

export default Organization;
