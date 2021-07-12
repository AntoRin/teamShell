import mongoose from "mongoose";
import { model } from "mongoose";
import { Schema } from "mongoose";
import { ProjectModel } from "../interfaces/ProjectModel";

const ProjectSchema = new Schema(
   {
      ProjectName: {
         type: String,
         required: true,
         unique: true,
      },
      ProjectDescription: {
         type: String,
         default: "",
      },
      ParentOrganization: {
         type: String,
         required: true,
      },
      InviteOnly: {
         type: Boolean,
         required: true,
         default: true,
      },
      IssuesRef: {
         type: [mongoose.Types.ObjectId],
      },
      Creator: {
         type: String,
         required: true,
      },
      Members: {
         type: Array,
         default: [],
      },
   },
   { timestamps: true, strictQuery: "throw" }
);

const Project = model<ProjectModel>("Project", ProjectSchema, "Projects");

export default Project;
