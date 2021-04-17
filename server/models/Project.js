const { model } = require("mongoose");
const { Schema } = require("mongoose");
const issueSchema = require("./issueSchema");

const ProjectSchema = new Schema(
   {
      ProjectName: {
         type: String,
         required: true,
      },
      ProjectDescription: {
         type: String,
         default: "",
      },
      ParentOrganization: {
         type: String,
         required: true,
      },
      Issues: {
         type: [issueSchema],
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
   { timestamps: true }
);

const Project = model("Project", ProjectSchema, "Projects");

module.exports = Project;
