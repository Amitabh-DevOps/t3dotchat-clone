"use server";

import { Output, streamObject, streamText, tool } from 'ai';
import { z } from 'zod';
import { google } from "@ai-sdk/google";
import { marked } from 'marked';

const searchTavily = async (query: string) => {
  const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
  
  if (!TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY environment variable is not set');
  }

  return mockData[location as keyof typeof mockData] || mockData.default;
};

export async function generateLoveDefinition(input: string) {
  const {textStream, toolCalls} = await streamText({
    model: google('models/gemini-2.0-flash-exp'),
    
    system: `You are a helpful AI assistant. You can help with various tasks including:
    - Answering general questions of any response length  
    - Getting weather information
    - Searching the web for current information
    - Note: You have to fulfill the user's request and you can provide information on any topic
    
    IMPORTANT FORMATTING RULE:
    When you use any tool, you MUST wrap your entire response (including the information from the tool) inside <t3-artifact> tags like this:
    
    <t3-artifact>
    [Your complete response based on the tool results goes here]
    </t3-artifact>
    
    When you need to use a tool, briefly mention what you're doing (e.g., "Let me search for that information...") and then proceed with the tool call.
    Always provide a complete response after using tools, and make sure to wrap it in the artifact tags.`,
    
    tools: {
      searchWeb: tool({
        description:
          'Search the web for current information, news, facts, or any topic that requires up-to-date data. ' +
          'Use this when you need recent information or specific facts not in your training data.',
        parameters: z.object({ 
          query: z.string().describe('The search query to find information about')
        }),
        execute: async ({ query }) => {
          console.log(`Searching for: ${query}`);
          try {
            const searchResults = await searchTavily(query);
            
            // Format the results for the AI model
            const formattedResults = {
              query: query,
              answer: searchResults.answer || 'No direct answer found',
              results: searchResults.results?.map((result: any) => ({
                title: result.title,
                url: result.url,
                content: result.content,
                score: result.score
              })) || []
            };
            
            // Return just the data - let the AI format it with tags
            return JSON.stringify(formattedResults, null, 2);
            
          } catch (error) {
            console.error('Search error:', error);
            return JSON.stringify({
              query: query,
              error: 'Failed to search the web. Please try again later.',
              results: []
            }, null, 2);
          }
        },
      }),
    },
    toolChoice: "auto",
    maxSteps: 2,
    prompt: input
  });

  for await (const text of textStream) {
    console.log(text);
  }
}
