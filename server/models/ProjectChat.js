const mongoose = require("mongoose");
const { Schema } = mongoose;
const { model } = mongoose;

const projectChatSchema = new Schema(
   {
      ProjectName: {
         type: String,
         required: true,
         Unique: true,
      },
      Messages: {
         type: [
            {
               from: { type: String, required: true },
               content: { type: String, required: true },
               time: { type: Date, default: Date.now },
            },
         ],
      },
   },
   { timestamps: true, strictQuery: "throw" }
);

const ProjectChat = model("ProjectChat", projectChatSchema, "ProjectChats");

module.exports = ProjectChat;
