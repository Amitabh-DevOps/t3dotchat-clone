'use server';
import mongoose, { Document } from "mongoose";

export interface ThreadType extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  isPinned: boolean;
  threadId: string;
  parentChatId?: mongoose.Types.ObjectId | null;
  shareChatId?: mongoose.Types.ObjectId | null;
}