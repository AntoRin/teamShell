import mongoose from "mongoose";
import { IChat } from "../interfaces/IChat";
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

const Chat = model<IChat>("Chat", chatSchema, "Chats");

export default Chat;
