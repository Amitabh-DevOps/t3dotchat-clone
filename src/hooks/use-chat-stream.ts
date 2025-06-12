import { createMessage } from "@/action/message.action";
import chatStore from "@/stores/chat.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

interface StreamState {
  currentResponse: string;
  isStreaming: boolean;
  error: string | null;
  setCurrentResponse: (response: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setError: (error: string | null) => void;
}

interface StreamResponse {
  fullResponse: string;
}

async function streamChatMessage(
  inputValue: string,
  onChunk?: (chunk: string, fullResponse: string) => void
): Promise<StreamResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: inputValue.trim() }],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let fullResponse = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      onChunk?.(chunk, fullResponse);
    }
  } finally {
    reader.releaseLock();
  }

  return { fullResponse };
}

const useStreamStore = create<StreamState>((set) => ({
  currentResponse: "",
  isStreaming: false,
  error: null,
  setCurrentResponse: (response) => set({ currentResponse: response }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setError: (error) => set({ error }),
}));

export function useChatStream() {
  const {
    currentResponse,
    isStreaming,
    error,
    setCurrentResponse,
    setIsStreaming,
    setError,
  } = useStreamStore();
  const queryClient = useQueryClient();
  const { query, setQuery, setResponse } = chatStore();

  const mutation = useMutation<
    StreamResponse,
    Error,
    { query: string; chatid: string }
  >({
    mutationKey: ["chat-stream"],
    mutationFn: ({ query }) =>
      streamChatMessage(query, (chunk, fullResponse) => {
        setCurrentResponse(fullResponse);
      }),
    onMutate: () => {
      setCurrentResponse("");
      setIsStreaming(true);
      setError(null);
    },
    onSuccess: async (e, { query, chatid }) => {
      setIsStreaming(false);
      setCurrentResponse("");
      setResponse("");
      await createMessage({
        threadId: chatid,
        userQuery: query,
        aiResponse: [{ content: e.fullResponse, model: "Gemini 2.5 Flash" }],
      });
      queryClient.invalidateQueries({ queryKey: ["thread-messages"] });
    },
    onError: (error) => {
      setIsStreaming(false);
      setError(error.message);
    },
  });

  return {
    currentResponse,
    isStreaming,
    error,
    mutate: mutation.mutate,
    isPending: mutation.isPending,
  };
}
