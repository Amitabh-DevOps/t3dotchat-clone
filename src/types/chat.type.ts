'use server';
import mongoose, { Document } from "mongoose";

export interface ChatType extends Document {
  threadId: mongoose.Types.ObjectId;
  userQuery: string;
  aiResponse: [
    {
        content: string;
        model: string;
    }
  ]
}