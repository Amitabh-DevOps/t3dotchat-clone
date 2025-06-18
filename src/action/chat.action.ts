"use server";
import { auth } from "@/auth";
import { decrypt } from "@/lib/secure-pwd";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

export const generateAiResponse = async ({ message }: { message: string }) => {
  try {
    if (!message) {
      throw new Error("Message is required");
    }

    const session = await auth()
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const openrouter = createOpenRouter({
        apiKey: decrypt(session?.user?.openRouterApiKey as string),
      });

      const { text } = await generateText({
        model: openrouter.chat('meta-llama/llama-3.1-405b-instruct'),
        prompt: message,
      });

   
    if (!text || text.trim() === "") {
      throw new Error("Received empty response from AI model");
    }

    return {
        data: text,
        error: null
    };
  } catch (error) {
    return {
        data: null,
        error: error instanceof Error ? error.message : "An error occurred"
    }
  }
};
