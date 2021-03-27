const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrganizationSchema = new Schema({
   Name: {
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

module.exports = { Organization, OrganizationSchema };
