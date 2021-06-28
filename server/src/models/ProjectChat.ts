import mongoose from "mongoose";
import { IProjectChat } from "../interfaces/IProjectChat";
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
               messageType: { type: String, required: true, default: "text" },
               content: { type: String, required: true },
               time: { type: Date, default: Date.now },
            },
         ],
      },
   },
   { timestamps: true, strictQuery: "throw" }
);

const ProjectChat = model<IProjectChat>("ProjectChat", projectChatSchema, "ProjectChats");

export default ProjectChat;
