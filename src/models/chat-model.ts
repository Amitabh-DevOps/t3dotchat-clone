'use server';
import mongoose, { Schema } from "mongoose";
import { ChatType } from "@/types/chat.type";

const ChatSchema = new Schema<ChatType>(
  {
    threadId: {
        type: Schema.Types.ObjectId,
        ref: "Thread",
        required: true
    },
    userQuery: {
        type: String,
        required: true,
        trim: true
    },
    aiResponse: [
        {
            content: {
                type: String,
                required: true
            },
            model: {
                type: String,
                required: true
            }
        }
    ]
  },
  { timestamps: true }
);

const Chat = mongoose.models?.Chat || mongoose.model<ChatType>("Chat", ChatSchema);

export default Chat;