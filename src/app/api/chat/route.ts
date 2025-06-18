import { NextRequest, NextResponse } from "next/server";
import { generateText, streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { GoogleGenAI, Modality } from "@google/genai";
import axios from "axios";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { auth } from "@/auth";

const uploadToCloudinary = async (
  imageBuffer: Buffer,
  filename: string
): Promise<any> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration is missing");
  }

  const formData = new FormData();

  // Create a Blob from the buffer and append as file
  const blob = new Blob([imageBuffer], { type: "image/png" });
  formData.append("file", blob, filename);
  formData.append("upload_preset", uploadPreset);
  formData.append("resource_type", "image");

  try {
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const response = await axios.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

const generateImage = async (prompt: string) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    let generatedText = "";
    let imageUrl = "";

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        generatedText = part.text;
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");

        // Generate unique filename
        const filename = `gemini-generated-${Date.now()}.png`;

        // Upload to Cloudinary
        const cloudinaryResponse = await uploadToCloudinary(buffer, filename);
        imageUrl = cloudinaryResponse.secure_url;
      }
    }

    return {
      text: generatedText,
      imageUrl: imageUrl,
      success: true,
    };
  } catch (error: any) {
    console.error("Image generation error:", error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
};

// Mock weather data function

// Tavily search function
const searchTavily = async (query: string) => {
  const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

  if (!TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY environment variable is not set");
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        include_answer: true,
        include_raw_content: false,
        max_results: 5,
        include_domains: [],
        exclude_domains: [],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Tavily API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Tavily search error:", error);
    throw error;
  }
};

const systemPrompt = `You are a creative, intelligent AI assistant that provides comprehensive, helpful responses while being natural and conversational.

CORE BEHAVIOR:
- Be creative, detailed, and thorough in your responses
- Provide complete solutions without asking unnecessary questions
- Make reasonable assumptions when details are missing
- Be proactive and helpful, not cautious or paranoid
- Give full, rich responses that satisfy user needs completely

CONVERSATION STYLE:
- Natural, engaging, and comprehensive
- Avoid being overly cautious or asking too many clarifying questions
- When users ask for something, DO IT - don't ask what they want unless truly ambiguous
- Provide detailed explanations and examples
- Be confident in your responses`;

export async function POST(request: NextRequest) {
  const session = await auth();
  try {
    const { messages, isWebSearch } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }
    const openrouter = createOpenRouter({
      apiKey: session?.user?.openRouterApiKey,
    });  
    const result = streamText({
      model: google("models/gemini-2.0-flash-exp"),
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      maxSteps: 3,
      toolChoice: "auto",
      tools: {
        generateImage: tool({
          description: `Generate an image based on a text prompt using Google's Gemini AI. 
            The generated image will be automatically uploaded to Cloudinary and return a <t3-image>url</t3-image> tag 
            Use this when users ask to create, generate, or make images and always return the <t3-image> tag with the url in it.`,
          parameters: z.object({
            prompt: z
              .string()
              .describe(
                "The detailed text prompt describing the image to generate"
              ),
          }),
          execute: async ({ prompt }) => {
            try {
              const result = await generateImage(prompt);
              console.log(result);
              return {
                prompt: prompt,
                success: result.success,
                text: result.text,
                imageUrl: `<t3-image>${result.imageUrl}</t3-image>`,
                message:
                  "Image generated successfully and uploaded to Cloudinary",
              };
            } catch (error: any) {
              console.error("Image generation tool error:", error);
              return {
                prompt: prompt,
                success: false,
                error: error.message,
                imageUrl: null,
                message: "Failed to generate image",
              };
            }
          },
        }),
        searchWeb: tool({
          description: `Search the web for current information, news, facts, or any topic that requires up-to-date data. 
            Use this when you need recent information or specific facts not in your training data and IMPORTANT: give the all content of the web search including url and title and return the content in <t3-websearch> tag.`,
          parameters: z.object({
            query: z
              .string()
              .describe("The search query to find information about"),
          }),
          execute: async ({ query }) => {
            try {
              if (!isWebSearch) {
                return {
                  query: query,
                  error: "Web search is disabled. Please try again later.",
                  results: [],
                };
              }
              const searchResults = await searchTavily(query);

              // Format the results for the AI model
              const formattedResults = {
                results:
                  searchResults.results?.map((result: any) => ({
                    title: result.title,
                    url: result.url,
                    content: result.content,
                    score: result.score,
                  })) || [],
              };
              return formattedResults;
            } catch (error) {
              console.error("Search error:", error);
              return {
                query: query,
                error: "Failed to search the web. Please try again later.",
                results: [],
              };
            }
          },
        }),
      },
    });

    console.log("the result is", result)

    // Use a more reliable streaming approach
    const encoder = new TextEncoder();

    // Handle the stream with proper error handling and completion
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = "";
          let activeToolMessages: string[] = []; // Track active tool messages

          for await (const delta of result.fullStream) {
            if (delta.type === "text-delta") {
              const text = delta.textDelta;
              buffer += text;
              controller.enqueue(encoder.encode(text));
            } else if (delta.type === "tool-call") {
              const toolName = delta.toolName;
              let searchingMsg = "";

              switch (toolName) {
                case "searchWeb":
                  searchingMsg = "\n\n <t3>Searching Web</t3>\n\n";
                  break;
                case "generateImage":
                  searchingMsg = "\n\n<t3>Generating Image</t3>\n\n";
                  break;
                default:
                  searchingMsg = "\n\n<t3>⏳ Processing...</t3>\n\n";
              }

              // Track this message so we can remove it later
              activeToolMessages.push(searchingMsg);
              controller.enqueue(encoder.encode(searchingMsg));
            } else if (delta.type === "tool-result") {
              // Clear all active tool messages by sending backspace characters
              // This is a simple approach - in a real UI, you'd want to handle this differently
              if (activeToolMessages.length > 0) {
                // Send a clear indicator that we're done with tool execution
                const clearMsg = "\r"; // Carriage return to overwrite the searching message
                controller.enqueue(encoder.encode(clearMsg));
                activeToolMessages = []; // Clear the tracking array
              }
              // Continue streaming - the AI will generate more text with the results
            }
          }

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          const errorMsg =
            "\n\n❌ An error occurred while processing your request.\n";
          controller.enqueue(encoder.encode(errorMsg));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
