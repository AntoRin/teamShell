import { Schema } from "mongoose";
import { model } from "mongoose";
import { ProfileImageDoc } from "../interfaces/ProfileImageDoc";

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

const ProfileImage = model<ProfileImageDoc>("ProfileImage", imageSchema, "ProfileImages");

export default ProfileImage;
