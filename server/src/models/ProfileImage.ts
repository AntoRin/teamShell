import { Schema } from "mongoose";
import { model } from "mongoose";
import { ProfileImageModel } from "../interfaces/ProfileImageModel";

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

const ProfileImage = model<ProfileImageModel>(
   "ProfileImage",
   imageSchema,
   "ProfileImages"
);

export default ProfileImage;
