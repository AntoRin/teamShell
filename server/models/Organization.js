const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrganizationSchema = new Schema({
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
});

const Organization = mongoose.model(
   "Organization",
   OrganizationSchema,
   "Organizations"
);

module.exports = Organization;
