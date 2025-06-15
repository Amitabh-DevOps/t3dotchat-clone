import { NextRequest, NextResponse } from 'next/server';
import { streamText, tool } from 'ai';
import { google } from "@ai-sdk/google";
import { auth } from '@/auth';
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

// Tavily search function
const searchTavily = async (query: string) => {
  const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
  
  if (!TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY environment variable is not set');
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        include_answer: true,
        include_raw_content: false,
        max_results: 5,
        include_domains: [],
        exclude_domains: []
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Tavily search error:', error);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  const session = await auth();
  
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    const result = streamText({
      model: google("models/gemini-2.0-flash-exp"),
      prompt: prompt,
      system: `You are a helpful AI assistant. You can help with various tasks including:
      - Answering general questions of any response length  
      - Getting weather information
      - Searching the web for current information
      -Note: Any how you have to fulfill the user's request and you can provide information any topic
      
      When you need to use a tool, briefly mention what you're doing (e.g., "Let me search for that information...") and then proceed with the tool call.
      Always provide a complete response after using tools.`,
      maxSteps: 5,
      toolChoice: "auto",
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
        
        searchWeb: tool({
          description:
            'Search the web for current information, news, facts, or any topic that requires up-to-date data. ' +
            'Use this when you need recent information or specific facts not in your training data.',
          parameters: z.object({ 
            query: z.string().describe('The search query to find information about')
          }),
          execute: async ({ query }) => {
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
              
              return formattedResults;
            } catch (error) {
              console.error('Search error:', error);
              return {
                query: query,
                error: 'Failed to search the web. Please try again later.',
                results: []
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
          let buffer = '';
          let activeToolMessages: string[] = []; // Track active tool messages

          for await (const delta of result.fullStream) {
            if (delta.type === 'text-delta') {
              const text = delta.textDelta;
              buffer += text;
              controller.enqueue(encoder.encode(text));
            } else if (delta.type === 'tool-call') {
              // Get tool-specific message
              const toolName = delta.toolName;
              let searchingMsg = '';
              
              switch (toolName) {
                case 'searchWeb':
                  searchingMsg = '\n\n🔍 Searching the web...\n\n';
                  break;
                case 'getWeather':
                  searchingMsg = '\n\n🌤️ Finding weather information...\n\n';
                  break;
                default:
                  searchingMsg = '\n\n⏳ Processing...\n\n';
              }
              
              // Track this message so we can remove it later
              activeToolMessages.push(searchingMsg);
              controller.enqueue(encoder.encode(searchingMsg));
            } else if (delta.type === 'tool-result') {
              // Clear all active tool messages by sending backspace characters
              // This is a simple approach - in a real UI, you'd want to handle this differently
              if (activeToolMessages.length > 0) {
                // Send a clear indicator that we're done with tool execution
                const clearMsg = '\r'; // Carriage return to overwrite the searching message
                controller.enqueue(encoder.encode(clearMsg));
                activeToolMessages = []; // Clear the tracking array
              }
              // Continue streaming - the AI will generate more text with the results
            }
          }

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          const errorMsg = '\n\n❌ An error occurred while processing your request.\n';
          controller.enqueue(encoder.encode(errorMsg));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}