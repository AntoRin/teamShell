const { Schema } = require("mongoose");
const { model } = require("mongoose");

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

const DriveFile = model("DriveFile", driveFileSchema, "DriveFiles");

module.exports = DriveFile;
