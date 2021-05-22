const mongoose = require("mongoose");
const { model } = require("mongoose");
const { Schema } = require("mongoose");

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
         type: [mongoose.Types._ObjectId],
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

const Project = model("Project", ProjectSchema, "Projects");

module.exports = Project;
