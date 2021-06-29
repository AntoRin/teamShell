import mongoose from "mongoose";
import { ChatModel } from "../interfaces/ChatModel";
const { Schema } = mongoose;
const { model } = mongoose;

const chatSchema = new Schema(
   {
      ChatID: {
         type: String,
         required: true,
         Unique: true,
      },
      Users: {
         type: Array,
         requried: true,
      },
      Messages: {
         type: [
            {
               from: { type: String, required: true },
               to: { type: String, required: true },
               content: { type: String, required: true },
               time: { type: Date, default: Date.now },
            },
         ],
      },
   },
   { timestamps: true, strictQuery: "throw" }
);

const Chat = model<ChatModel>("Chat", chatSchema, "Chats");

export default Chat;
