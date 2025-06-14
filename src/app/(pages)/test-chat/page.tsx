// components/SimpleStreamingChat.tsx
'use client';

import { useStreamResponse } from '@/hooks/use-response-stream';
import chatStore from '@/stores/chat.store'; // Adjust path as needed

export default function SimpleStreamingChat() {
  const { query, setQuery, response, messages } = chatStore();
  const { isLoading, error, sendMessage, clearMessages } = useStreamResponse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || isLoading) return;

    await sendMessage({chatid:"da50400a-d5e6-413b-9e6d-ced59fa9c7f1"});
    setQuery('');
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
          <div key={index} className="space-y-3">
            {/* User Query */}
            <div className="p-3 rounded-lg max-w-[80%] bg-blue-500 text-white ml-auto">
              <div className="text-sm font-semibold mb-1">User</div>
              <p>{message.userQuery}</p>
            </div>
            
            {/* AI Response */}
            <div className="p-3 rounded-lg max-w-[80%] bg-white text-gray-800 border">
              <div className="text-sm font-semibold mb-1">Assistant</div>
              <p>{message.aiResponse[0].content}</p>
            </div>
          </div>
        ))}
        
        {/* Current streaming response */}
        {(response || isLoading) && (
          <div className="space-y-3">
            {/* Current user query */}
            <div className="p-3 rounded-lg max-w-[80%] bg-blue-500 text-white ml-auto">
              <div className="text-sm font-semibold mb-1">User</div>
              <p>{query}</p>
            </div>
            
            {/* Streaming AI response */}
            <div className="p-3 rounded-lg max-w-[80%] bg-white text-gray-800 border">
              <div className="text-sm font-semibold mb-1">Assistant</div>
              <div className="whitespace-pre-wrap">
                {response}
                {isLoading && (
                  <span className="animate-pulse bg-gray-400 inline-block w-2 h-5 ml-1"></span>
                )}
              </div>
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
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}