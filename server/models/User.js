const mongoose = require("mongoose");
const { Schema } = mongoose;

const { OrganizationSchema } = require("./Organization");

const UserSchema = new Schema(
   {
      UniqueUsername: {
         type: String,
         required: true,
         unique: true,
      },
      Username: {
         type: String,
         default: "",
      },
      Email: {
         type: String,
         required: true,
         unique: true,
      },
      Password: {
         type: String,
         required: true,
      },
      ProfileImage: {
         type: String,
         default: "No Image",
      },
      Organization: {
         type: String,
         default: "None",
         unique: true,
      },
      Project: {
         type: String,
         default: "None",
         unique: true,
      },
   },
   { timestamps: true }
);

const User = mongoose.model("User", UserSchema, "Users");

module.exports = User;
