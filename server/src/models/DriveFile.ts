import { Schema } from "mongoose";
import { model } from "mongoose";
import { DriveFileModel } from "../interfaces/DriveFileModel";

const driveFileSchema = new Schema(
   {
      creator: {
         type: String,
         required: true,
      },
      project: {
         type: String,
         required: true,
      },
      name: {
         type: String,
      },
      id: {
         type: String,
      },
      description: {
         type: String,
      },
      mimeType: {
         type: String,
      },
      iconLink: {
         type: String,
      },
      thumbnailLink: {
         type: String,
      },
      webContentLink: {
         type: String,
         required: true,
      },
      webViewLink: {
         type: String,
         required: true,
      },
      createdTime: {
         type: Date,
      },
   },
   { strictQuery: "throw" }
);

const DriveFile = model<DriveFileModel>(
   "DriveFile",
   driveFileSchema,
   "DriveFiles"
);

export default DriveFile;
