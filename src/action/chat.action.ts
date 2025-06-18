// "use server";
// import { serializeData } from "@/lib/constant";
// import { google } from "@ai-sdk/google";
// import { generateText } from "ai";
// import { Message } from "ai";

// export const generateAiResponse = async ({message}:{message:Message}) => {
//   try {
//     if (!message) {
//       throw new Error("Message is required");
//     }
//     const {text} = await generateText({
//       model: google("gemini-2.0-flash-exp"),
//       messages: [message],
//       system: `You are a helpful AI assistant. You can help with various tasks including:
//       - Answering general questions of any response length1`
//       `,
//     });
    
//     console.log(text, "response");
    
//     // Add safety check for empty response
//     if (!text || text.trim() === "") {
//       throw new Error("Received empty response from AI model");
//     }
    
//     return text;
//   } catch (error) {
//     console.error("Error generating AI response:", error);
//     throw new Error("Failed to generate AI response");
//   }
// };