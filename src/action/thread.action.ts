"use server";
import connectDB from "@/config/db";
import { serializeData } from "@/lib/constant";
import Thread from "@/models/thread.model";
import { auth } from "@/auth";
import Message from "@/models/message.model";

export const getThread = async () => {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }
  try {
    await connectDB();

    const threads = await Thread.find({
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    return {
      data: serializeData(threads),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error,
    };
  }
};

export const createThread = async ({ title }: { title?: string }) => {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }

  try {
    await connectDB();

    const thread = await Thread.create({
      userId: session.user.id,
      title: title || "New Thread",
    });

    return {
      data: serializeData(thread),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error,
    };
  }
};

export const pinThread = async ({ threadId }: { threadId: string }) => {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }
  try {

    await connectDB();

    const thread = await Thread.findOne({
      _id: threadId,
      userId: session.user.id,
    });

    if (!thread) {
      return {
        data: null,
        error: "Thread not found",
      };
    }

    thread.isPinned = !thread.isPinned;

    await thread.save();

    return {
      data: serializeData(thread),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error,
    };
  }
};

export const renameThread = async ({
  threadId,
  title,
}: {
  threadId: string;
  title: string;
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

    const thread = await Thread.findOne({
      _id: threadId,
      userId: session.user.id,
    });

    if (!thread) {
      return {
        data: null,
        error: "Thread not found",
      };
    }

    thread.title = title;

    await thread.save();

    return {
      data: serializeData(thread),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error,
    };
  }
};

export const deleteThread = async ({ threadId }: { threadId: string }) => {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }
  try {
    await connectDB();
    
    const thread = await Thread.findOne({
      _id: threadId,
      userId: session.user.id,
    });

    if (!thread) {
      return {
        data: null,
        error: "Thread not found",
      };
    }

    await Thread.deleteOne({ _id: threadId });

    await Message.deleteMany({ threadId: threadId });

    return {
      data: serializeData(thread),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error,
    };
  }
};