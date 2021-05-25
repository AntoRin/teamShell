const { Schema } = require("mongoose");
const { model } = require("mongoose");

const imageSchema = new Schema(
   {
      UserContext: {
         type: String,
         required: true,
         unique: true,
      },
      ImageData: {
         type: String,
         required: true,
      },
   },
   { strictQuery: "throw" }
);

const ProfileImage = model("ProfileImage", imageSchema, "ProfileImages");

module.exports = ProfileImage;
