'use server';
import mongoose, { Document } from "mongoose";

export interface MessageType extends Document {
  threadId: mongoose.Types.ObjectId;
  userQuery: string;
  aiResponse: [
    {
        content: string;
        model: string;
    }
  ]
}