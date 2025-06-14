"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCcw, SquarePen, Copy, Check, GitBranch } from "lucide-react";
import chatStore from "@/stores/chat.store";
import { getMessages } from "@/action/message.action";
import { useIsMutating, useQuery } from "@tanstack/react-query";
import { MessagePair, StreamingMessagePair } from "./message-container";
const ChatContainer = () => {
  const params = useParams();
  const {
    response,
    messages,
    setMessages,
    query,
    setResponse,
    setQuery,
    isLoading,
  } = chatStore();

  const { data } = useQuery({
    queryKey: ["thread-messages", params.chatid],
    queryFn: async () => {
      setMessages([]);
      const posts = await getMessages({ threadId: params.chatid as string });
      setMessages(posts.data);
      return posts.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: !!params.chatid,
  });

  useEffect(() => {
    setMessages([]);
    setResponse("");
    return () => {
      setMessages([]);
      setResponse("");
    };
  }, [params.chatid, setMessages, setResponse]);

  const isMutating = useIsMutating({ mutationKey: ["chat-stream"] });

  // Handler functions (you can implement these based on your needs)
  const handleRetry = (messageId?: string) => {
    console.log("Retry:", messageId);
  };

  const handleEdit = (messageId?: string) => {
    console.log("Edit:", messageId);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleBranch = (messageId?: string) => {
    console.log("Branch:", messageId);
  };

  return (
    <div
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
      className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pb-60 pt-10"
    >
      {/* Render stored messages */}
      {messages &&
        Array.isArray(messages) &&
        messages.length > 0 &&
        messages.map((message, index) => (
          <MessagePair
            key={index}
            message={message}
            onRetryUser={() => handleRetry(message.id)}
            onEditUser={() => handleEdit(message.id)}
            onCopyUser={() => handleCopy(message.userQuery)}
            onRetryAI={() => handleRetry(`${message.id}-response`)}
            onCopyAI={() => handleCopy(message?.aiResponse?.[0]?.content || "")}
            onBranchAI={() => handleBranch(`${message.id}-response`)}
          />
        ))}

      {/* Current streaming response */}
      {(response || isLoading) && (
        <StreamingMessagePair
          userQuery={query}
          aiResponse={response}
          isLoading={isLoading}
          onRetryUser={() => handleRetry("current-query")}
          onEditUser={() => handleEdit("current-query")}
          onCopyUser={() => handleCopy(query)}
          onRetryAI={() => handleRetry("current-response")}
          onCopyAI={() => handleCopy(response)}
          onBranchAI={() => handleBranch("current-response")}
        />
      )}
    </div>
  );
};

export default ChatContainer;
