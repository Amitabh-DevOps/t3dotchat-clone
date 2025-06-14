'use server';
import { Document } from "mongoose";

export interface userType extends Document {
  name: string;
  email: string;
  image: string;
  t3ChatInfo: {
    username: string;
    profession: string;
    skills: string[];
    additionalInfo: string;
  }
  apiKeys: {
    model: string;
    key: string;
  }[],  
  isDeleted: boolean;
}