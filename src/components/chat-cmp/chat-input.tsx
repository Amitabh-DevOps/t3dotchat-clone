// components/ChatInput.tsx
"use client";

import React, { useCallback, KeyboardEvent, useEffect, useState } from "react";
import { ArrowUp, ChevronDown, Globe, Paperclip } from "lucide-react";
import { Button } from "../ui/button";
import { useStore } from "zustand";
import chatStore from "@/stores/chat.store";
import { useChatStream } from "@/hooks/use-chat-stream";
import { createThread } from "@/action/thread.action";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useStreamResponse } from "@/hooks/use-response-stream";
import SearchModels from "./search-models";

interface ChatInputProps {
  placeholder?: string;
  modelName?: string;
  isSearchEnabled?: boolean;
  isFileAttachEnabled?: boolean;
}

function ChatInput({
  placeholder = "Type your message here...",
  modelName = "Gemini 2.5 Flash",
  isSearchEnabled = false,
  isFileAttachEnabled = false,
}: ChatInputProps) {
  const params = useParams();
  const router = useRouter();
  const { isLoading, error, sendMessage, clearMessages } = useStreamResponse();
  const [input, setInput] = useState("");
  const { setQuery } = chatStore();

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      setQuery(input.trim());
      setInput("");
      handleSubmit();
    }
  };

  const generateUUID = () => {
    const newId = uuidv4(); // Generates a UUID v4, e.g., 6ea46723-95e2-40ea-8dd2-fdcc2a0cc4dc
    return newId;
  };

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    const generatedId = generateUUID();
    if (!params.chatid) {
      await createThread({ title: "New Thread", threadId: generatedId });
      router.push(`/chat/${generatedId}`);
    }
    await sendMessage({ chatid: (params.chatid as string) || generatedId });
  }, [
    isLoading,
    sendMessage,
    params.chatid,
    generateUUID,
    createThread,
    router,
    input,
  ]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setQuery(input.trim());
    setInput("");
    handleSubmit();
  };


  return (
    <div className="absolute !bottom-0 h-fit inset-x-0 w-full">
      <div className="rounded-t-[20px] bg-chat-input-background/80 dark:bg-secondary/30 p-2 pb-0 backdrop-blur-lg ![--c:--chat-input-gradient] border-x border-secondary-foreground/5 gradBorder">
        <form
          onSubmit={handleFormSubmit}
          className="relative flex w-full pb-2 flex-col items-stretch gap-2 rounded-t-xl border border-b-0 border-white/70 dark:border-secondary-foreground/5 bg-chat-input-background px-3 pt-3 text-secondary-foreground outline-8 outline-chat-input-gradient/50 dark:outline-chat-input-gradient/5 pb-safe-offset-3 max-sm:pb-6 sm:max-w-3xl dark:bg-secondary/30"
          style={{
            boxShadow:
              "rgba(0, 0, 0, 0.1) 0px 80px 50px 0px, rgba(0, 0, 0, 0.07) 0px 50px 30px 0px, rgba(0, 0, 0, 0.06) 0px 30px 15px 0px, rgba(0, 0, 0, 0.04) 0px 15px 8px, rgba(0, 0, 0, 0.04) 0px 6px 4px, rgba(0, 0, 0, 0.02) 0px 2px 2px",
          }}
        >
          <div className="flex flex-grow flex-col">
            <div className="flex flex-grow flex-row items-start">
              <textarea
                placeholder={placeholder}
                autoFocus
                id="chat-input"
                value={input}
                className="w-full max-h-64 min-h-[54px] resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-secondary-foreground/60 disabled:opacity-50 transition-opacity"
                aria-label="Message input"
                aria-describedby="chat-input-description"
                autoComplete="off"
                onKeyDown={handleKeyDown}
                onChange={(e) => setInput(e.target.value)}
              />
              <div id="chat-input-description" className="sr-only">
                Press Enter to send, Shift + Enter for new line
              </div>
            </div>

            <div className="-mb-px mt-2 flex w-full flex-row-reverse justify-between">
              <div
                className="-mr-0.5 -mt-0.5 flex items-center justify-center gap-2"
                aria-label="Message actions"
              >
                <Button
                  variant="t3"
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="transition-[opacity, translate-x] h-9 w-9 duration-200"
                >
                  <ArrowUp className="!size-5" />
                </Button>
              </div>

              <div className="flex flex-col gap-2 pr-2 sm:flex-row sm:items-center">
                <div className="ml-[-7px] flex items-center gap-1">
                  {/* Model Selector */}
                 <SearchModels/>

                  {/* Search Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent hover:bg-muted/40 !rounded-full text-xs !h-auto py-1.5 !px-2"
                    aria-label={
                      isSearchEnabled
                        ? "Web search"
                        : "Web search not available on free plan"
                    }
                    // disabled={!isSearchEnabled || isLoading}
                  >
                    <Globe className="h-4 w-4" />
                    <span className="max-sm:hidden">Search</span>
                  </Button>

                  {/* File Attach Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent hover:bg-muted/40 !rounded-full text-xs !h-auto py-1.5 !px-2.5"
                    aria-label={
                      isFileAttachEnabled
                        ? "Attach file"
                        : "Attaching files is a subscriber-only feature"
                    }
                    // disabled={!isFileAttachEnabled || isLoading}
                  >
                    <Paperclip className="size-4" />
                  </Button>
                
                </div>
              </div>
            </div>
          </div>

          {/* {error && (
            <div className="mt-2 text-red-600 text-sm animate-in fade-in duration-200">
              Error: {error}
            </div>
          )}

          {isStreaming && (
            <div className="mt-2 text-muted-foreground text-sm animate-pulse">
              Streaming response...
            </div>
          )} */}
        </form>
      </div>
    </div>
  );
}

export default ChatInput;
