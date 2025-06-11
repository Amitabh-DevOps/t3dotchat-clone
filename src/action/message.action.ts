"use server";
import { auth } from "@/auth";
import Message from "@/models/message.model";
import { serializeData } from "@/lib/constant";
import Thread from "@/models/thread.model";
import connectDB from "@/config/db";

export const getMessages = async ({ threadId }: { threadId: string }) => {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }
  try {
    await connectDB();

    const thread = await Thread.findOne({ _id: threadId, userId: session.user.id });

    if (!thread) {
      return {
        data: null,
        error: "Thread not found",
      };
    }

    const messages = await Message.find({ threadId: threadId }).sort({
      createdAt: 1,
    });

    if (!messages || messages.length === 0) {
      return {
        data: null,
        error: "No messages found",
      };
    }

    return {
      data: serializeData(messages),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error,
    };
  }
};

export const createMessage = async ({ 
  threadId, 
  userQuery, 
  aiResponse 
}: { 
  threadId: string; 
  userQuery: string; 
  aiResponse: { content: string; model: string }[] 
}) => {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }

  try {
    await connectDB();

    // Verify that the thread exists and belongs to the user
    const thread = await Thread.findOne({ _id: threadId, userId: session.user.id });

    if (!thread) {
      return {
        data: null,
        error: "Thread not found",
      };
    }

    // Create the message
    const message = await Message.create({
      threadId,
      userQuery,
      aiResponse,
    });

    return {
      data: serializeData(message),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || "Failed to create message",
    };
  }
}; 