import { NextRequest, NextResponse } from "next/server";
import { generateText, streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/auth";
import { z } from "zod";
import { GoogleGenAI, Modality } from "@google/genai";
import axios from "axios";

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

const getMockWeather = (location: string) => {
  console.log(location);
  const mockData = {
    "New York": { temperature: 72, condition: "Sunny", humidity: 60 },
    London: { temperature: 65, condition: "Cloudy", humidity: 75 },
    Tokyo: { temperature: 80, condition: "Rainy", humidity: 80 },
    default: { temperature: 70, condition: "Partly Cloudy", humidity: 65 },
  };

  return mockData[location] || mockData.default;
};

export async function POST(request: NextRequest) {
  const session = await auth();

  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const result = streamText({
      model: google("models/gemini-2.0-flash-exp"),
      messages: messages,
      temperature: 1,
      system: `Generate a diagram based on a text prompt using AI. 
    The generated diagram will be automatically created and return a <t3-diagram>mermaid_code</t3-diagram> tag. 
    Use this when users ask to create, generate, or make diagrams, flowcharts, charts, or visual representations and always return the <t3-diagram> tag with the mermaid code in it.`,
      maxSteps: 3,
      toolChoice: "auto",
      tools: {
        generateDiagram: tool({
          description:
            `A tool to generate diagram code based on a text description. Use this when users ask to create flowcharts, diagrams, organizational charts, sequence diagrams, or any visual representation.`,
          parameters: z.object({
            description: z
              .string()
              .describe("The detailed description of the diagram to generate (e.g., 'create a flowchart for user login process')"),
            diagramType: z
              .string()
              .optional()
              .describe("Optional: specify diagram type (flowchart, sequence, class, state, etc.)")
          }),
          execute: async ({ description, diagramType }) => {
            try {
              const prompt = `Generate valid Mermaid diagram code for the following description: "${description}"
              ${diagramType ? `Diagram type: ${diagramType}` : ''}
              
              CRITICAL REQUIREMENTS:
              - Return ONLY valid Mermaid syntax code
              - No explanations, comments, or additional text
              - Must be syntactically correct Mermaid code
              - Use proper Mermaid syntax and structure
              - Be precise and accurate to the description
              
              Examples:
              graph TD
                  A[Start] --> B{Decision}
                  B -->|Yes| C[Action 1]
                  B -->|No| D[Action 2]
                  
              sequenceDiagram
                  participant A as Alice
                  participant B as Bob
                  A->>B: Hello Bob
                  B->>A: Hello Alice
                  
              classDiagram
                  class Animal {
                      +String name
                      +move()
                  }`;
        
              const { text: mermaidCode } = await generateText({
                model: google("models/gemini-2.0-flash-exp"),
                prompt: prompt,
              });
        
              return {
                success: true,
                diagramCode: mermaidCode.replace(/^```mermaid\s*|\s*```$/gm, '')
                .replace(/^```.*$/gm, '')
                .trim(),
              };
            } catch (error) {
              console.error("Diagram generation error:", error);
              return {
                success: false,
                diagramCode: `graph TD\n    A[Error] --> B[Failed to generate]`
              };
            }
          },
        }),
        getWeather: tool({
          description:
            `A tool to get weather information for a specified location. 
            Example: "New York", "London", "Tokyo". Returns temperature (in Fahrenheit), condition, and humidity.`,
          parameters: z.object({ location: z.string() }),
          execute: async ({ location }) => {
            const weather = getMockWeather(location);
            return {
              location,
              temperature: weather.temperature,
              condition: weather.condition,
              humidity: weather.humidity,
            };
          },
        }),
        generateImage: tool({
          description:
            `Generate an image based on a text prompt using Google's Gemini AI. 
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
          description:
            `Search the web for current information, news, facts, or any topic that requires up-to-date data. 
            Use this when you need recent information or specific facts not in your training data and IMPORTANT: give the all content of the web search including url and title.`,
          parameters: z.object({
            query: z
              .string()
              .describe("The search query to find information about"),
          }),
          execute: async ({ query }) => {
            try {
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
              // Get tool-specific message
              const toolName = delta.toolName;
              let searchingMsg = "";

              switch (toolName) {
                case "searchWeb":
                  searchingMsg = "\n\n <t3> Search Tool </t3>\n\n";
                  break;
                case "getWeather":
                  searchingMsg = "\n\n<t3>Weather Tool</t3>\n\n";
                  break;
                default:
                  searchingMsg = "\n\n⏳ Processing...\n\n";
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
