const mongoose = require("mongoose");
const { Schema } = mongoose;

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
      Bio: {
         type: String,
         default: "",
      },
      Notifications: {
         type: [
            {
               NotificationType: {
                  type: String,
                  required: true,
               },
               NotificationContent: {
                  type: String,
                  required: true,
               },
            },
         ],
         default: [],
      },
      Organizations: {
         type: [
            {
               OrganizationName: { type: String, required: true },
               Status: { type: String, required: true },
            },
         ],
         default: [],
      },
      Projects: {
         type: Array,
         default: [],
      },
      Issues: {
         type: [
            {
               Created: {
                  type: Array,
                  default: [],
               },
               Assigned: {
                  type: Array,
                  default: [],
               },
            },
         ],
         default: [],
      },
   },
   { timestamps: true }
);

const User = mongoose.model("User", UserSchema, "Users");

module.exports = User;
