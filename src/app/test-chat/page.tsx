// components/SimpleStreamingChat.tsx
'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SimpleStreamingChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setCurrentResponse('');
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: updatedMessages 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let assistantResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantResponse += chunk;
        setCurrentResponse(assistantResponse);
      }

      // Add the complete response to messages
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: assistantResponse 
      };
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentResponse('');

    } catch (err) {
      console.error('Streaming error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setCurrentResponse('');
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Simple Streaming Chat</h1>
        <button
          onClick={clearMessages}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Clear Chat
        </button>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-gray-50 p-4 rounded-lg">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              message.role === 'user'
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-white text-gray-800 border'
            }`}
          >
            <div className="text-sm font-semibold mb-1 capitalize">
              {message.role}
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
        
        {/* Current streaming response */}
        {(currentResponse || isLoading) && (
          <div className="p-3 rounded-lg max-w-[80%] bg-white text-gray-800 border">
            <div className="text-sm font-semibold mb-1">Assistant</div>
            <div className="whitespace-pre-wrap">
              {currentResponse}
              {isLoading && (
                <span className="animate-pulse bg-gray-400 inline-block w-2 h-5 ml-1"></span>
              )}
            </div>
          </div>
        )}
        
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-8">
            Start a conversation by typing a message below
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}