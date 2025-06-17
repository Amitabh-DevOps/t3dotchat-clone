"use server";
import connectDB from "@/config/db";
import { serializeData } from "@/lib/constant";
import Thread from "@/models/thread.model";
import { auth } from "@/auth";
import Message from "@/models/message.model";
import { getMessageUsage } from "./message.action";

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

    // Get today's date range (start and end of today)
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Filter threads into categories
    const pinnedThreads = threads.filter(thread => thread.isPinned === true);
    
    const todayThreads = threads.filter(thread => {
      const threadDate = new Date(thread.createdAt);
      return threadDate >= startOfToday && 
             threadDate < endOfToday && 
             thread.isPinned !== true; // Exclude pinned threads from today
    });

    const weekThreads = threads.filter(thread => {
      const threadDate = new Date(thread.createdAt);
      return !(threadDate >= startOfToday && threadDate < endOfToday) && // Not today
             thread.isPinned !== true; // Not pinned
    });

    return {
        data: {
          pin: serializeData(pinnedThreads),
          today: serializeData(todayThreads),
          week: serializeData(weekThreads)
        },
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message,
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
      threadId: threadId,
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
      threadId: threadId,
      userId: session.user.id,
    });

    if (!thread) {
      return {
        data: null,
        error: "Thread not found",
      };
    }

    await Thread.deleteOne({ threadId: threadId });

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
export const createThread = async ({
  title,
  threadId,
}: {
  title?: string;
  threadId: string;
}) => {
  const session = await auth();
console.log(threadId, title);
  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }

  try {
    await connectDB();

    const countMessages = await getMessageUsage();

    // if (countMessages.data && countMessages.data >= 20) {
    //   return {
    //     data: null,
    //     error: "You have reached the maximum number of messages for today",
    //   };
    // }
    const thread = await Thread.create({
      threadId: threadId,
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
      error: error.message,
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
      threadId: threadId,
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



export const searchThread = async ({ query }: { query?: string }) => {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }
  try {
    await connectDB();

    if (query) {
      const threads = await Thread.find({
        userId: session.user.id,
        title: { $regex: query, $options: "i" },
      })
        .sort({ createdAt: -1 })
        .select("threadId title isPinned createdAt");
      return {
        data: serializeData(threads),
        error: null,
      };
    }

    const threads = await Thread.find({
      userId: session.user.id,
    })
      .sort({ createdAt: -1 })
      .select("threadId title isPinned createdAt");
    return {
      data: serializeData(threads),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error,
    };
  }
};

export const bulkDeleteThread = async ({ threadIds }: { threadIds: string[] }) => {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }
  try {
    await connectDB();

    const threads = await Thread.find({userId: session.user.id, threadId: {$in: threadIds}});

    if (threads.length !== threadIds.length) {
      return {
        data: null,
        error: "Some threads not found",
      };
    }
    
    await Thread.deleteMany({userId: session.user.id, threadId: {$in: threadIds}});

    await Message.deleteMany({threadId: {$in: threadIds}});

    return {
      data: serializeData(threads),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message,
    };
  }
}