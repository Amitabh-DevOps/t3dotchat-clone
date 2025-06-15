"use server";
import connectDB from "@/config/db";
import { serializeData } from "@/lib/constant";
import User from "@/models/user.model";
import { auth } from "@/auth";

export const getUser = async () => {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }

  try {
    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return {
        data: null,
        error: "User not found",
      };
    }

    return {
      data: serializeData(user),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message,
    };
  }
};

export const addApiKey = async ({
  model,
  key,
}: {
  model: string;
  key: string;
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

    const user = await User.findById(session.user.id);

    if (!user) {
      return {
        data: null,
        error: "User not found",
      };
    }

    // Check if model already exists
    const existingApiKey = user.apiKeys.find(
      (apiKey: any) => apiKey.model === model
    );

    if (existingApiKey) {
      return {
        data: null,
        error: "API key for this model already exists",
      };
    }

    user.apiKeys.push({ model, key });
    await user.save();

    return {
      data: serializeData(user.apiKeys),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message,
    };
  }
};

export const updateApiKey = async ({
  _id,
  key,
}: {
  _id: string;
  key: string;
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

    const user = await User.findById(session.user.id);

    if (!user) {
      return {
        data: null,
        error: "User not found",
      };
    }

    const apiKeyIndex = user.apiKeys.findIndex(
      (apiKey: any) => apiKey._id.toString() === _id
    );

    if (apiKeyIndex === -1) {
      return {
        data: null,
        error: "API key not found",
      };
    }

    if (key !== undefined) {
      user.apiKeys[apiKeyIndex].key = key;
    }

    await user.save();

    return {
      data: serializeData(user.apiKeys),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message,
    };
  }
};

export const deleteApiKey = async ({ _id }: { _id: string }) => {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }

  try {
    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return {
        data: null,
        error: "User not found",
      };
    }

    const apiKeyIndex = user.apiKeys.findIndex(
      (apiKey: any) => apiKey._id.toString() === _id
    );

    if (apiKeyIndex === -1) {
      return {
        data: null,
        error: "API key not found",
      };
    }

    user.apiKeys.splice(apiKeyIndex, 1);
    await user.save();

    return {
      data: serializeData(user.apiKeys),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message,
    };
  }
};

export const updateT3ChatInfo = async ({
  username,
  profession,
  skills,
  additionalInfo,
}: {
  username?: string;
  profession?: string;
  skills?: string[];
  additionalInfo?: string;
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

    const user = await User.findById(session.user.id);

    if (!user) {
      return {
        data: null,
        error: "User not found",
      };
    }

    // Initialize t3ChatInfo if it doesn't exist
    if (!user.t3ChatInfo) {
      user.t3ChatInfo = {};
    }

    // Update only provided fields
    if (username !== undefined) {
      user.t3ChatInfo.username = username;
    }
    if (profession !== undefined) {
      user.t3ChatInfo.profession = profession;
    }
    if (skills !== undefined) {
      user.t3ChatInfo.skills = skills;
    }
    if (additionalInfo !== undefined) {
      user.t3ChatInfo.additionalInfo = additionalInfo;
    }

    await user.save();

    return {
      data: serializeData(user.t3ChatInfo),
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message,
    };
  }
};