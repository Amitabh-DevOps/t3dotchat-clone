import { NextRequest, NextResponse } from "next/server";
import { generateText, streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { GoogleGenAI, Modality } from "@google/genai";
import axios from "axios";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { auth } from "@/auth";
import { decrypt } from "@/lib/secure-pwd";

// Error types for better error handling
enum ErrorType {
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  API_KEY_ERROR = "API_KEY_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS",
  PAYMENT_ERROR = "PAYMENT_ERROR",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  CLOUDINARY_ERROR = "CLOUDINARY_ERROR",
  GEMINI_ERROR = "GEMINI_ERROR",
  TAVILY_ERROR = "TAVILY_ERROR",
  OPENROUTER_ERROR = "OPENROUTER_ERROR",
  STREAM_ERROR = "STREAM_ERROR",
  SAFETY_ERROR = "SAFETY_ERROR",
  MODEL_ERROR = "MODEL_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Service names for error tagging
enum ServiceName {
  OPENROUTER = "OpenRouter",
  GEMINI = "Gemini AI",
  CLOUDINARY = "Cloudinary",
  TAVILY = "Tavily Search",
  SYSTEM = "System",
  AUTHENTICATION = "Authentication",
}

interface ServiceError {
  type: ErrorType;
  service: ServiceName;
  message: string;
  details?: any;
  statusCode?: number;
}

// Helper function to create error tags for frontend
const createErrorTag = (service: ServiceName, message: string): string => {
  return `<t3-error>${service}: ${message}</t3-error>`;
};

// Helper function to create success tags
const createSuccessTag = (service: ServiceName, message: string): string => {
  return `<t3-success>${service}: ${message}</t3-success>`;
};

// Helper function to create info tags
const createInfoTag = (message: string): string => {
  return `<t3-init-tool>${message}</t3-init-tool>`;
};

// Comprehensive error categorization with service identification
const categorizeError = (
  error: any,
  defaultService: ServiceName = ServiceName.SYSTEM
): ServiceError => {
  const errorMessage = error.message?.toLowerCase() || "";
  const errorStatus =
    error.status || error.response?.status || error.statusCode;
  const errorCode = error.code || error.response?.data?.code || "";

  // OpenRouter specific errors
  if (
    errorMessage.includes("openrouter") ||
    errorMessage.includes("llama") ||
    errorMessage.includes("meta-llama")
  ) {
    if (
      errorMessage.includes("insufficient credits") ||
      errorMessage.includes("credit limit") ||
      errorMessage.includes("credits")
    ) {
      return {
        type: ErrorType.INSUFFICIENT_CREDITS,
        service: ServiceName.OPENROUTER,
        message: "Insufficient credits in your account",
        details: error.response?.data || error.message,
        statusCode: 402,
      };
    }

    if (
      errorMessage.includes("payment") ||
      errorMessage.includes("billing") ||
      errorStatus === 402
    ) {
      return {
        type: ErrorType.PAYMENT_ERROR,
        service: ServiceName.OPENROUTER,
        message: "Payment required or billing issue",
        details: error.response?.data || error.message,
        statusCode: 402,
      };
    }

    if (errorMessage.includes("rate limit") || errorStatus === 429) {
      return {
        type: ErrorType.RATE_LIMIT_ERROR,
        service: ServiceName.OPENROUTER,
        message: "Rate limit exceeded",
        details: error.response?.data || error.message,
        statusCode: 429,
      };
    }

    if (
      errorMessage.includes("api key") ||
      errorMessage.includes("unauthorized") ||
      errorStatus === 401
    ) {
      return {
        type: ErrorType.API_KEY_ERROR,
        service: ServiceName.OPENROUTER,
        message: "Invalid or missing API key",
        details: error.response?.data || error.message,
        statusCode: 401,
      };
    }

    if (
      errorMessage.includes("model") ||
      errorMessage.includes("not found") ||
      errorStatus === 404
    ) {
      return {
        type: ErrorType.MODEL_ERROR,
        service: ServiceName.OPENROUTER,
        message: "Model not found or unavailable",
        details: error.response?.data || error.message,
        statusCode: 404,
      };
    }

    return {
      type: ErrorType.OPENROUTER_ERROR,
      service: ServiceName.OPENROUTER,
      message: "Service error occurred",
      details: error.response?.data || error.message,
      statusCode: errorStatus || 500,
    };
  }

  // Gemini specific errors
  if (
    errorMessage.includes("gemini") ||
    errorMessage.includes("google") ||
    errorMessage.includes("genai")
  ) {
    if (
      errorMessage.includes("api key") ||
      errorMessage.includes("unauthorized") ||
      errorStatus === 401
    ) {
      return {
        type: ErrorType.API_KEY_ERROR,
        service: ServiceName.GEMINI,
        message: "Invalid or missing API key",
        details: error.message,
        statusCode: 401,
      };
    }

    if (
      errorMessage.includes("quota") ||
      errorMessage.includes("limit") ||
      errorStatus === 429
    ) {
      return {
        type: ErrorType.QUOTA_EXCEEDED,
        service: ServiceName.GEMINI,
        message: "API quota exceeded",
        details: error.message,
        statusCode: 429,
      };
    }

    if (
      errorMessage.includes("safety") ||
      errorMessage.includes("content policy")
    ) {
      return {
        type: ErrorType.SAFETY_ERROR,
        service: ServiceName.GEMINI,
        message: "Content violates safety guidelines",
        details: error.message,
        statusCode: 400,
      };
    }

    return {
      type: ErrorType.GEMINI_ERROR,
      service: ServiceName.GEMINI,
      message: "Image generation failed",
      details: error.message,
      statusCode: errorStatus || 500,
    };
  }

  // Cloudinary specific errors
  if (errorMessage.includes("cloudinary")) {
    if (
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("authentication") ||
      errorStatus === 401
    ) {
      return {
        type: ErrorType.API_KEY_ERROR,
        service: ServiceName.CLOUDINARY,
        message: "Invalid upload preset or credentials",
        details: error.message,
        statusCode: 401,
      };
    }

    if (errorMessage.includes("timeout") || errorCode === "ECONNABORTED") {
      return {
        type: ErrorType.TIMEOUT_ERROR,
        service: ServiceName.CLOUDINARY,
        message: "Upload timeout",
        details: error.message,
        statusCode: 408,
      };
    }

    return {
      type: ErrorType.CLOUDINARY_ERROR,
      service: ServiceName.CLOUDINARY,
      message: "Image upload failed",
      details: error.message,
      statusCode: errorStatus || 500,
    };
  }

  // Tavily specific errors
  if (errorMessage.includes("tavily")) {
    if (
      errorMessage.includes("api key") ||
      errorMessage.includes("unauthorized") ||
      errorStatus === 401
    ) {
      return {
        type: ErrorType.API_KEY_ERROR,
        service: ServiceName.TAVILY,
        message: "Invalid or missing API key",
        details: error.message,
        statusCode: 401,
      };
    }

    if (errorMessage.includes("rate limit") || errorStatus === 429) {
      return {
        type: ErrorType.RATE_LIMIT_ERROR,
        service: ServiceName.TAVILY,
        message: "Rate limit exceeded",
        details: error.message,
        statusCode: 429,
      };
    }

    if (
      errorMessage.includes("credits") ||
      errorMessage.includes("payment") ||
      errorStatus === 402
    ) {
      return {
        type: ErrorType.INSUFFICIENT_CREDITS,
        service: ServiceName.TAVILY,
        message: "Insufficient credits or payment required",
        details: error.message,
        statusCode: 402,
      };
    }

    return {
      type: ErrorType.TAVILY_ERROR,
      service: ServiceName.TAVILY,
      message: "Search service error",
      details: error.message,
      statusCode: errorStatus || 500,
    };
  }

  // General error categorization
  if (errorMessage.includes("rate limit") || errorStatus === 429) {
    return {
      type: ErrorType.RATE_LIMIT_ERROR,
      service: defaultService,
      message: "Rate limit exceeded",
      details: error.message,
      statusCode: 429,
    };
  }

  if (
    errorMessage.includes("api key") ||
    errorMessage.includes("unauthorized") ||
    errorStatus === 401
  ) {
    return {
      type: ErrorType.API_KEY_ERROR,
      service: defaultService,
      message: "Invalid or missing API key",
      details: error.message,
      statusCode: 401,
    };
  }

  if (
    errorMessage.includes("authentication") ||
    errorMessage.includes("forbidden") ||
    errorStatus === 403
  ) {
    return {
      type: ErrorType.AUTHENTICATION_ERROR,
      service: ServiceName.AUTHENTICATION,
      message: "Authentication failed",
      details: error.message,
      statusCode: 403,
    };
  }

  if (
    errorMessage.includes("network") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("econnrefused") ||
    errorCode === "ECONNREFUSED"
  ) {
    return {
      type: ErrorType.NETWORK_ERROR,
      service: defaultService,
      message: "Network connection failed",
      details: error.message,
      statusCode: 503,
    };
  }

  if (errorMessage.includes("timeout") || errorCode === "ECONNABORTED") {
    return {
      type: ErrorType.TIMEOUT_ERROR,
      service: defaultService,
      message: "Request timeout",
      details: error.message,
      statusCode: 408,
    };
  }

  // Default unknown error
  return {
    type: ErrorType.UNKNOWN_ERROR,
    service: defaultService,
    message: error.message || "An unexpected error occurred",
    details: error,
    statusCode: errorStatus || 500,
  };
};

// Always return a streaming response, even for errors
const createErrorStream = (error: ServiceError): Response => {
  const encoder = new TextEncoder();
  const errorMessage = createErrorTag(error.service, error.message);

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(errorMessage));
      controller.close();
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
};

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

    for (const part of response?.candidates?.[0]?.content?.parts || []) {
      if (part.text) {
        generatedText = part.text;
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData || "", "base64");

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
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error(`Tavily authentication failed: Invalid API key`);
      }

      if (response.status === 429) {
        throw new Error(
          `Tavily rate limit exceeded: ${
            errorData.message || "Too many requests"
          }`
        );
      }

      if (response.status === 402) {
        throw new Error(
          `Tavily insufficient credits: ${
            errorData.message || "Payment required"
          }`
        );
      }

      throw new Error(
        `Tavily API error: ${response.status} ${
          errorData.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Tavily search error:", error);

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        `Tavily network error: Unable to connect to search service`
      );
    }

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
  let session;

  try {
    // Authentication check
    try {
      session = await auth();
      if (!session?.user?.openRouterApiKey) {
        const error: ServiceError = {
          type: ErrorType.AUTHENTICATION_ERROR,
          service: ServiceName.AUTHENTICATION,
          message: "Please log in and configure your OpenRouter API key",
          statusCode: 401,
        };
        return createErrorStream(error);
      }
    } catch (error: any) {
      const serviceError: ServiceError = {
        type: ErrorType.AUTHENTICATION_ERROR,
        service: ServiceName.AUTHENTICATION,
        message: "Authentication service unavailable",
        details: error.message,
        statusCode: 503,
      };
      return createErrorStream(serviceError);
    }

    // Parse and validate request body
    let messages, isWebSearch, model;
    try {
      const body = await request.json();
      messages = body.messages;
      isWebSearch = body.isWebSearch;
      model = body.model;
    } catch (error) {
      const serviceError: ServiceError = {
        type: ErrorType.VALIDATION_ERROR,
        service: ServiceName.SYSTEM,
        message: "Invalid request format",
        statusCode: 400,
      };
      return createErrorStream(serviceError);
    }

    if (!messages || !Array.isArray(messages)) {
      const serviceError: ServiceError = {
        type: ErrorType.VALIDATION_ERROR,
        service: ServiceName.SYSTEM,
        message: "Messages array is required",
        statusCode: 400,
      };
      return createErrorStream(serviceError);
    }

    // Decrypt and validate API key
    let decryptedApiKey;
    try {
      decryptedApiKey = decrypt(session.user.openRouterApiKey as string);
      if (!decryptedApiKey) {
        throw new Error("Failed to decrypt API key");
      }
    } catch (error) {
      const serviceError: ServiceError = {
        type: ErrorType.API_KEY_ERROR,
        service: ServiceName.OPENROUTER,
        message: "Invalid or corrupted API key",
        statusCode: 401,
      };
      return createErrorStream(serviceError);
    }

    // Initialize OpenRouter
    let openrouter;
    try {
      openrouter = createOpenRouter({
        apiKey: decryptedApiKey,
      });
    } catch (error: any) {
      const categorizedError = categorizeError(error, ServiceName.OPENROUTER);
      return createErrorStream(categorizedError);
    }

    // Create streaming response with comprehensive error handling
    let result;
    try {
      result = streamText({
        model: openrouter.chat(model || "meta-llama/llama-3.1-405b-instruct"),
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
    } catch (error: any) {
      console.error("StreamText initialization error:", error);
      const categorizedError = categorizeError(error, ServiceName.OPENROUTER);
      return createErrorStream(categorizedError);
    }

    // Create the streaming response with robust error handling
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = "";
          let activeToolMessages: string[] = [];

          for await (const delta of result.fullStream) {
            try {
              if (delta.type === "text-delta") {
                const text = delta.textDelta;
                buffer += text;
                controller.enqueue(encoder.encode(text));
              } else if (delta.type === "tool-call") {
                const toolName = delta.toolName;
                let processingMsg = "";

                switch (toolName) {
                  case "searchWeb":
                    processingMsg = createInfoTag("Searching web...");
                    break;
                  case "generateImage":
                    processingMsg = createInfoTag("Generating image...");
                    break;
                  default:
                    processingMsg = createInfoTag("Processing...");
                }

                activeToolMessages.push(processingMsg);
                controller.enqueue(encoder.encode(`\n\n${processingMsg}\n\n`));
              } else if (delta.type === "tool-result") {
                if (activeToolMessages.length > 0) {
                  // Clear the processing message
                  const clearMsg = "\r";
                  controller.enqueue(encoder.encode(clearMsg));
                  activeToolMessages = [];
                }
              } else if (delta.type === "error") {
                // Handle streaming errors
                const categorizedError = categorizeError(
                  delta.error,
                  ServiceName.OPENROUTER
                );
                const errorMsg = createErrorTag(
                  categorizedError.service,
                  categorizedError.message
                );
                controller.enqueue(encoder.encode(`\n\n${errorMsg}\n\n`));
                // Don't close the stream, continue if possible
              }
            } catch (deltaError: any) {
              // Handle individual delta processing errors
              console.error("Delta processing error:", deltaError);
              const categorizedError = categorizeError(
                deltaError,
                ServiceName.SYSTEM
              );
              const errorMsg = createErrorTag(
                categorizedError.service,
                "Stream processing error"
              );
              controller.enqueue(encoder.encode(`\n\n${errorMsg}\n\n`));
              // Continue processing other deltas
            }
          }

          // Stream completed successfully
          controller.close();
        } catch (streamError: any) {
          console.error("Stream processing error:", streamError);
          const categorizedError = categorizeError(
            streamError,
            ServiceName.SYSTEM
          );
          const errorMsg = createErrorTag(
            categorizedError.service,
            categorizedError.message
          );

          // Always send some response, even if it's an error
          try {
            controller.enqueue(
              encoder.encode(
                `\n\n${errorMsg}\n\nI encountered an error while processing your request, but I'm still here to help. Please try rephrasing your question or try again.\n\n`
              )
            );
          } catch (encodeError) {
            console.error("Error encoding error message:", encodeError);
          }

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
  } catch (error: any) {
    // Final catch-all error handler - always return a stream
    console.error("API route critical error:", error);
    const categorizedError = categorizeError(error, ServiceName.SYSTEM);
    return createErrorStream(categorizedError);
  }
}
