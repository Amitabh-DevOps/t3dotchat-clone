'use server';
import mongoose, { Schema } from "mongoose";
import { MessageType } from "@/types/chat.type";

const MessageSchema = new Schema<MessageType>(
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

const Message = mongoose.models?.Message || mongoose.model<MessageType>("Message", MessageSchema);

export default Message;