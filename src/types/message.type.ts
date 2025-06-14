'use server';
import mongoose, { Document } from "mongoose";

export interface MessageType extends Document {
  threadId: string;
  userQuery: string;
  aiResponse: [
    {
        content: string;
        model: string;
    }
  ];
  createdAt: Date;
}