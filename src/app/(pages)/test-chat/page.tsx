"use client";

import { generateLoveDefinition } from "@/action/temp.action";
import { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    // Call server action with user input
    const response = await generateLoveDefinition(input);
    if (response.success) {
      const botMessage = { role: "bot", content: response.text };
      setMessages((prev) => [...prev, botMessage]);
    } else {
      setError(response.error);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-center">LoveBot</h1>
      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-100 ml-auto max-w-[80%]"
                : "bg-gray-200 mr-auto max-w-[80%]"
            }`}
          >
            <span className="font-semibold">{msg.role === "user" ? "You" : "LoveBot"}: </span>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="text-center text-gray-500">LoveBot is thinking...</div>
        )}
        {error && <div className="text-red-500 text-center">{error}</div>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about love or anything else..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}