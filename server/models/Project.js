const { model } = require("mongoose");
const { Schema } = require("mongoose");

const ProjectSchema = new Schema({
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
      type: Array,
      default: [],
   },
   Creator: {
      type: String,
      required: true,
   },
   Members: {
      type: Array,
      default: [],
   },
});

const Project = model("Project", ProjectSchema, "Projects");

module.exports = Project;
