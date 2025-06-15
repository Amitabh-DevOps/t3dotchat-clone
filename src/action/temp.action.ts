"use server";
import { generateText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// Mock weather data function
const getMockWeather = (location: string) => {
    console.log(location);
  const mockData = {
    "New York": { temperature: 72, condition: "Sunny", humidity: 60 },
    "London": { temperature: 65, condition: "Cloudy", humidity: 75 },
    "Tokyo": { temperature: 80, condition: "Rainy", humidity: 80 },
    default: { temperature: 70, condition: "Partly Cloudy", humidity: 65 },
  };

  return mockData[location] || mockData.default;
};

export async function generateLoveDefinition(prompt: string) {
  try {
    const { text } = await generateText({
      model: google("models/gemini-2.0-flash-exp"),
      maxSteps: 2,
      tools: {
        getWeather: tool({
          description:
            'A tool to get weather information for a specified location. ' +
            'Example: "New York", "London", "Tokyo". Returns temperature (in Fahrenheit), condition, and humidity.',
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
      },
      prompt: prompt || "What is love?",
    });
    return { success: true, text };
  } catch (error) {
    console.error("Error generating text:", error);
    return { success: false, error: "Failed to generate text" };
  }
}