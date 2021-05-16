const mongoose = require("mongoose");
const { Schema } = mongoose;
const { model } = mongoose;

const chatSchema = new Schema(
   {
      ChatID: {
         type: String,
         required: true,
         Unique: true,
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

const Chat = model("Chat", chatSchema, "Chats");

module.exports = Chat;
