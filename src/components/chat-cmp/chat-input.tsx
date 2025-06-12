// components/ChatInput.tsx
"use client";

import React, { useCallback, KeyboardEvent, useEffect } from "react";
import { ArrowUp, ChevronDown, Globe, Paperclip } from "lucide-react";
import { Button } from "../ui/button";
import { useStore } from "zustand";
import chatStore from "@/stores/chat.store";
import { useChatStream } from "@/hooks/use-chat-stream";
import { createThread } from "@/action/thread.action";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

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
  const { query, setQuery, setResponse } = useStore(chatStore);
  const { currentResponse, isStreaming, error, mutate, isPending } =
    useChatStream();
  const params = useParams();
  const router = useRouter();
  useEffect(() => {
    if (currentResponse) {
      setResponse(currentResponse);
    }
  }, [currentResponse, setResponse]);
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const generateUUID = () => {
    const newId = uuidv4(); // Generates a UUID v4, e.g., 6ea46723-95e2-40ea-8dd2-fdcc2a0cc4dc
    return newId;
  };

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!query || isPending) return;
    const generatedId = generateUUID();
    if (!params.chatid) {
      await createThread({title: "New Thread", threadId:generatedId})
      router.push(`/chat/${generatedId}`);
    }
    mutate({ query , chatid: params.chatid as string || generatedId });
    setQuery(""); // Clear input after submission
  }, [query, isPending, mutate, setQuery]);

  // Handle form submit event
  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleSubmit();
    },
    [handleSubmit]
  );

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
                value={query}
                className="w-full max-h-64 min-h-[48px] resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-secondary-foreground/60 disabled:opacity-50 transition-opacity"
                aria-label="Message input"
                aria-describedby="chat-input-description"
                autoComplete="off"
                onKeyDown={handleKeyDown}
                onChange={(e) => setQuery(e.target.value)}
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
                  disabled={isPending || !query.trim()}
                  className="transition-all duration-200"
                >
                  <ArrowUp className="!size-5" />
                </Button>
              </div>

              <div className="flex flex-col gap-2 pr-2 sm:flex-row sm:items-center">
                <div className="ml-[-7px] flex items-center gap-1">
                  {/* Model Selector */}
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 h-8 rounded-md text-xs relative gap-2 px-2 py-1.5 -mb-2 text-muted-foreground"
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded="false"
                    disabled={isPending}
                  >
                    <div className="text-left text-sm font-medium">
                      {modelName}
                    </div>
                    <ChevronDown className="right-0 size-4" />
                  </button>

                  {/* Search Button */}
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 px-3 text-xs -mb-1.5 h-auto gap-2 rounded-full border border-solid border-secondary-foreground/10 py-1.5 pl-2 pr-2.5 text-muted-foreground max-sm:p-2"
                    type="button"
                    aria-label={
                      isSearchEnabled
                        ? "Web search"
                        : "Web search not available on free plan"
                    }
                    disabled={!isSearchEnabled || isPending}
                  >
                    <Globe className="h-4 w-4" />
                    <span className="max-sm:hidden">Search</span>
                  </button>

                  {/* File Attach Button */}
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs -mb-1.5 h-auto gap-2 rounded-full border border-solid border-secondary-foreground/10 px-2 py-1.5 pr-2.5 text-muted-foreground max-sm:p-2"
                    type="button"
                    aria-label={
                      isFileAttachEnabled
                        ? "Attach file"
                        : "Attaching files is a subscriber-only feature"
                    }
                    disabled={!isFileAttachEnabled || isPending}
                  >
                    <Paperclip className="size-4" />
                  </button>
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
