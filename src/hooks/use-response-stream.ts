import { useState, useCallback } from "react";
import chatStore from "@/stores/chat.store";
import { createMessage } from "@/action/message.action";

interface Message {
  userQuery: string;
  aiResponse: Array<{ content: string }>;
}

interface UseStreamResponseReturn {
  isLoading: boolean;
  error: string | null;
  sendMessage: ({
    chatid,
    attachmentUrl,
    resetAttachment,
  }: {
    chatid: string;
    attachmentUrl?: string;
    resetAttachment?: () => void;
  }) => Promise<void>;
  clearMessages: () => void;
}

export function useStreamResponse(): UseStreamResponseReturn {
  const { isLoading, setIsLoading } = chatStore();
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async ({
      chatid,
      attachmentUrl,
      resetAttachment,
    }: {
      chatid: string;
      attachmentUrl?: string;
      resetAttachment?: () => void;
    }) => {
      const { query, messages, setMessages, setResponse, setQuery } =
        chatStore.getState();

      if (!query?.trim() || isLoading) return;
      const trimmedQuery = query.trim();
      const attachment = attachmentUrl ? attachmentUrl : "";
      resetAttachment && resetAttachment();
      setIsLoading(true);
      setResponse("");
      setError(null);

      try {
        const apiMessages =
          messages && Array.isArray(messages) && messages.length > 0
            ? messages.flatMap((msg: Message) => [
                {
                  role: "user" as const,
                  content: [{ type: "text", text: msg.userQuery }],
                },
                {
                  role: "assistant" as const,
                  content: [
                    { type: "text", text: msg.aiResponse[0]?.content || "" },
                  ],
                },
              ])
            : [];

        apiMessages.push({
          role: "user" as const,
          content: [
            {
              type: attachment ? "image" : "text",
              mimeType: attachment ? "image/jpeg" : "text/plain",
              text: trimmedQuery,
              image: attachment ? new URL(attachment) : undefined,
            } as any,
          ],
        });

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: apiMessages,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("Response body is not readable");
        }

        let assistantResponse = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantResponse += chunk;
          chatStore.getState().setResponse(assistantResponse);
        }

        console.log(chatid);
        const savedMessage = await createMessage({
          threadId: chatid,
          userQuery: query,
          attachment: attachment,
          aiResponse: [
            { content: assistantResponse, model: "Gemini 2.5 Flash" },
          ],
        });
        console.log(savedMessage);
        const currentMessages =
          messages && Array.isArray(messages) ? messages : [];
        console.log([...currentMessages, { ...savedMessage.data }]);
        chatStore
          .getState()
          .setMessages([...currentMessages, { ...savedMessage.data }]);
        chatStore.getState().setResponse("");
      } catch (err) {
        console.error("Streaming error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const clearMessages = useCallback(() => {
    const { setMessages, setResponse, setQuery } = chatStore.getState();
    setMessages([]);
    setResponse("");
    setQuery("");
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
