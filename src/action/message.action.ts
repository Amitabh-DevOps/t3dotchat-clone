"use server";
import { auth } from "@/auth";
import Message from "@/models/message.model";
import { serializeData } from "@/lib/constant";
import Thread from "@/models/thread.model";
import connectDB from "@/config/db";
import { MessageType } from "@/types/message.type";

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

    // Find the current thread
    const thread = await Thread.findOne({
      threadId: threadId,
      userId: session.user.id,
    });

    if (!thread) {
      return {
        data: null,
        error: "Thread not found",
      };
    }

    let allMessages: MessageType[] = [];

    if (thread.parentChatId) {
      const parentMessage = await Message.findOne({
        _id: thread.parentChatId,
        userId: session.user.id,
      });

      if (parentMessage) {
        const parentThreadId = parentMessage.threadId;

        const parentMessages = await Message.find({
          threadId: parentThreadId,
          createdAt: { $lte: parentMessage.createdAt },
        }).sort({ createdAt: 1 });

        if (parentMessages && parentMessages.length > 0) {
          allMessages = [...parentMessages];
        }
      }
    }

    const currentMessages = await Message.find({
      threadId: threadId,
    }).sort({ createdAt: 1 });

    if (currentMessages && currentMessages.length > 0) {
      allMessages = [...allMessages, ...currentMessages];
    }

    // Sort all messages by creation time to maintain chronological order
    allMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    if (allMessages.length === 0) {
      return {
        data: null,
        error: "No messages found",
      };
    }

    return {
      data: serializeData(allMessages),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || "An error occurred while fetching messages",
    };
  }
};

export const getMessageUsage = async () => {
  const session = await auth();
  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }
  try {
    await connectDB();

    const todayMessagesCount = await Message.countDocuments({
      userId: session.user.id,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    return {
      data: serializeData(todayMessagesCount),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error,
    };
  }
};

export const createMessage = async ({
  threadId,
  userQuery,
  aiResponse,
}: {
  threadId: string;
  userQuery: string;
  aiResponse: { content: string; model: string }[];
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

    const countMessages = await getMessageUsage();

    if (countMessages.data && countMessages.data >= 20) {
      return {
        data: null,
        error: "You have reached the maximum number of messages for today",
      };
    }

    const thread = await Thread.findOne({
      threadId: threadId,
      userId: session.user.id,
    });

    if (!thread) {
      return {
        data: null,
        error: "Thread not found",
      };
    }
    console.log("me who who who");
    const message = await Message.create({
      threadId,
      userId: session.user.id,
      userQuery,
      aiResponse,
    });
    console.log(message, "save message");
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

export const regenerateAnotherResponse = async ({
  messageId,
  aiResponse,
}: {
  messageId: string;
  aiResponse: { content: string; model: string };
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

    const message = await Message.findOne({
      _id: messageId,
      userId: session.user.id,
    });

    if (!message) {
      return {
        data: null,
        error: "Message not found",
      };
    }

    await message.aiResponse.push(aiResponse);

    await message.save();

    return {
      data: serializeData(message),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || "Failed to regenerate response",
    };
  }
};

export const getAttachmentMessage = async () => {
  const session = await auth();
  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }
  try {
    await connectDB();

    const messages = await Message.find({
      userId: session.user.id,
      attachment: { $ne: null },
    });

    if (!messages || messages.length === 0) {
      return {
        data: null,
        error: "No attachment messages found",
      };
    }

    return {
      data: serializeData(messages),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error,
    };
  }
};
