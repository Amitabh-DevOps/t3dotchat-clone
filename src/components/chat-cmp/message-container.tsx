"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  RefreshCcw,
  SquarePen,
  Copy,
  Check,
  GitBranch,
  Search,
  Cloud,
  X,
  Download,
  WrapText,
  Menu,
  CopyCheck,
  CopyCheckIcon,
} from "lucide-react";
import { parse } from "node-html-parser";
import { marked } from "marked";
import { codeToHtml, createCssVariablesTheme, createHighlighter } from "shiki";
import { renderToString } from "react-dom/server";
import { LuCopy, LuText } from "react-icons/lu";
import { Message as AiMessage } from "ai";
import { useChatStream } from "@/hooks/use-chat-stream";
import { regenerateAnotherResponse } from "@/action/message.action";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import chatStore from "@/stores/chat.store";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { processSpecificT3Tags } from "@/lib/chat-parser";
import { branchThread } from "@/action/thread.action";
import BranchOffIcon from "../../../public/icons/branch-off";
import { FiLoader } from "react-icons/fi";

// Types
interface Message {
  _id: string;
  userQuery: string;
  aiResponse?: Array<{ content: string }>;
  attachment?: string;
}

interface MessageActionsProps {
  onRetry?: () => void;
  onEdit?: () => void;
  totalResponses?: number;
  responseIndex?: number;
  setResponseIndex?: (index: number) => void;
  onCopy?: () => void;
  userQuery?: string;
  onBranch?: () => void;
  showBranch?: boolean;
  showEdit?: boolean;
  modelName?: string;
  role: string;
  messageId?: string;
  message?: Message;
}

// Reusable Message Actions Component
export const MessageActions: React.FC<MessageActionsProps> = ({
  onEdit,
  message,
  onCopy,
  onBranch,
  role,
  messageId,
  userQuery,
  totalResponses = 0,
  responseIndex = 0,
  setResponseIndex = () => {},
  showBranch = false,
  showEdit = true,
  modelName,
}) => {
  const { isLoading, error, response, sendMessage, clearResponse } =
    useChatStream();
  const router = useRouter();

  const queryClient = useQueryClient();
  const { messages, setMessages, setIsRegenerate } = chatStore();
  const retryMessage = async () => {
    setIsRegenerate(true);
    const attachment = message?.attachment;
    const trimmedQuery = message?.userQuery;

    if (!trimmedQuery?.trim()) {
      console.log("No query to retry");
      return;
    }

    const promptMessage: any = {
      role: "user",
      content: [
        {
          type: attachment ? "image" : "text",
          mimeType: attachment ? "image/jpeg" : "text/plain",
          text: trimmedQuery,
          image: attachment ? new URL(attachment) : undefined,
        },
      ],
    };

    try {
      const response = await sendMessage(promptMessage);

      const generateResponse = await regenerateAnotherResponse({
        messageId: message?._id || "",
        aiResponse: { content: response, model: "gpt-3.5-turbo" },
      });
      if (generateResponse.error) {
        toast.error("Failed to regenerate response");
      }
      if (response?.trim() !== "") {
        chatStore?.setState({
          messages: messages?.map((message: Message) => {
            if (message._id === messageId) {
              return {
                ...message,
                aiResponse: [
                  ...(message?.aiResponse || []),
                  { content: response, model: "gpt-3.5-turbo" },
                ],
              };
            }
            return message;
          }),
        });
      }
      setResponseIndex(generateResponse?.data?.aiResponse?.length - 1 || 0);
    } catch (err) {
      console.error("Retry failed:", err);
    }
  };

  const { mutate: handleBranch, isPending: isBranching } = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await branchThread({ messageId });
      if (response.error) {
        throw new Error("Error while branching off");
      }
      return response.data;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      router.push(`/chat/${data?.threadId}`);
    },
  });

  return (
    <div className="flex items-center gap-1">
      {role === "assistant" && totalResponses > 1 && (
        <span className="flex items-center gap-1">
          <button
            disabled={responseIndex === 0}
            className="cursor-pointer"
            onClick={() => setResponseIndex(responseIndex - 1)}
          >
            <IoIosArrowBack />
          </button>{" "}
          {responseIndex + 1}/{totalResponses}{" "}
          <button
            disabled={responseIndex === totalResponses - 1}
            className="cursor-pointer"
            onClick={() => setResponseIndex(responseIndex + 1)}
          >
            <IoIosArrowForward />
          </button>
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-xs"
        aria-label="Copy to clipboard"
        onClick={onCopy}
        data-state="closed"
      >
        <div className="relative size-4">
          <Copy
            className="absolute inset-0 h-4 w-4 transition-[opacity, translate-x] duration-200 ease-snappy scale-100 opacity-100"
            aria-hidden="true"
          />
          <Check
            className="absolute inset-0 h-4 w-4 transition-[opacity, translate-x] duration-200 ease-snappy scale-0 opacity-0"
            aria-hidden="true"
          />
        </div>
      </Button>

      {role === "assistant" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-xs"
          aria-label="Branch off message"
          onClick={() => handleBranch(messageId as string)}
          data-state="closed"
        >
          <div className="relative size-4 *:text-muted-foreground">
            {isBranching ? (
              <FiLoader className="animate-spin" />
            ) : (
              <BranchOffIcon />
            )}
          </div>
        </Button>
      )}

      {role === "assistant" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-xs"
          aria-label="Retry message"
          onClick={retryMessage}
          data-action="retry"
          data-state="closed"
        >
          <div className="relative size-4">
            <RefreshCcw
              className={`${isLoading ? "animate-spin" : "h-4 w-4"}`}
              aria-hidden="true"
            />
            <span className="sr-only">Retry</span>
          </div>
        </Button>
      )}

      {role === "user" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-xs"
          aria-label="Edit message"
          data-state="closed"
          onClick={onEdit}
        >
          <SquarePen className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}

      {/* {modelName && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{modelName}</span>
        </div>
      )} */}
    </div>
  );
};

// User Message Component

interface UserMessageProps {
  content: string;
  attachmentUrl?: string;
  messageId?: string;
  onRetry?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  content,
  messageId,
  onRetry,
  attachmentUrl,
  onEdit,
  onCopy,
}) => {
  const { setQuery } = chatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEdit = () => {
    setIsEditing(!isEditing);
    setEditContent(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setQuery(editContent);
      setIsEditing(false);
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(content);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    setEditContent(content);
  };

  return (
    <div
      data-message-id={messageId}
      className="flex relative justify-end items-end flex-col"
    >
      {isEditing ? (
        <div className="flex items-end gap-1 flex-col w-full ">
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full edit-input  border !border-secondary/50 focus:ring ring-secondary/80 max-h-48 min-h-16 outline-none bg-transparent text-inherit font-inherit leading-inherit p-2 rounded-xl shadow-inner"
            placeholder="Type your message..."
          />
          <MessageActions
            role="user"
            onEdit={handleEdit}
            onCopy={onCopy}
            showBranch={false}
            showEdit={true}
          />
        </div>
      ) : (
        <>
          <div
            role="article"
            aria-label="Your message"
            className="group inline-block max-w-[80%] break-words rounded-xl border border-secondary/50 bg-secondary/50 p-3.5 px-4 text-left"
          >
            <span className="sr-only">Your message: </span>
            <div className="flex flex-col gap-3">
              <div className="prose prose-pink max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
                <p>{content || ""}</p>
              </div>
            </div>
            <div className="absolute right-0 -bottom-10 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
              <MessageActions
                role="user"
                onEdit={handleEdit}
                onCopy={onCopy}
                showBranch={false}
                showEdit={true}
              />
            </div>
          </div>
          {attachmentUrl && (
            <div className="h-16 origin-center ease-snappy scale-100 has-[input:checked]:scale-110 -translate-y-1/2 overflow-hidden has-[input:not(:checked)]:!translate-none -translate-x-1/2 left-1/2 top-1/2 mt-2 has-[input:checked]:fixed has-[input:checked]:w-[80vw] has-[input:checked]:z-50 has-[input:checked]:h-[70vh] transition-[scale] w-16 rounded-xl bg-secondary/20 border-2 p-1 border-secondary/50 aspect-square">
              <input
                type="checkbox"
                name={messageId}
                id={messageId}
                className={`${messageId} checked:hidden cursor-pointer peer z-10 absolute opacity-0 inset-0`}
              />

              <img
                className="object-cover relative rounded-lg h-full w-full peer-checked:object-contain peer-checked:max-w-full peer-checked:max-h-full"
                src={attachmentUrl}
                alt={messageId + "-attachment"}
                loading="lazy"
              />

              <label
                htmlFor={messageId}
                className="absolute cursor-pointer border-input border-2 rounded-md bg-border peer-checked:block hidden top-2 right-2 z-20"
              >
                <X size={20} />
              </label>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface AIResponseProps {
  content: string;
  responseIndex?: number;
  setResponseIndex?: (index: number) => void;
  totalResponses?: number;
  message?: Message;
  messageId?: string;
  isStreaming?: boolean;
  isLoading?: boolean;
  modelName?: string;
  onRetry?: () => void;
  onCopy?: () => void;
  onBranch?: () => void;
}

export const AIResponse: React.FC<AIResponseProps> = ({
  content,
  responseIndex,
  setResponseIndex,
  totalResponses,
  message,
  messageId,
  isStreaming = false,
  modelName = "Gemini 2.5 Flash",
  onRetry,
  onCopy,
  onBranch,
}) => {
  const [htmlContent, setHtmlContent] = useState("");

  const convertMarkdown = async () => {
    try {
      const html = await marked(content || "");
      const { processedHtml } = await processSpecificT3Tags(html || "");
      setHtmlContent(processedHtml);
    } catch (error) {
      console.error("Error converting Markdown:", error);
      setHtmlContent(content || "");
    }
  };

  useEffect(() => {
    convertMarkdown();
  }, [content]);

  return (
    <div data-message-id={messageId} className="flex justify-start">
      <div className="group relative w-full max-w-full break-words">
        <div
          role="article"
          aria-label="Assistant message"
          className="prose prose-pink max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0"
        >
          <span className="sr-only">Assistant Reply: </span>
          {!htmlContent ? (
            <div className="flex space-x-2 mt-2">
              <div className="w-2.5 h-2.5 bg-primary/50 rounded-full animate-bounce-dot animate-delay-1"></div>
              <div className="w-2.5 h-2.5 bg-primary/50 rounded-full animate-bounce-dot animate-delay-2"></div>
              <div className="w-2.5 h-2.5 bg-primary/50 rounded-full animate-bounce-dot"></div>
            </div>
          ) : (
            <div
              className="mark-response"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </div>
        <div className="absolute left-0 -ml-0.5 mt-2 flex w-full flex-row justify-start gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
          <div className="flex w-full flex-row justify-between gap-1 sm:w-auto">
            <MessageActions
              onRetry={onRetry}
              role="assistant"
              message={message}
              messageId={messageId}
              totalResponses={totalResponses}
              responseIndex={responseIndex}
              setResponseIndex={setResponseIndex}
              onCopy={onCopy}
              onBranch={onBranch}
              showBranch={true}
              showEdit={false}
              modelName={modelName}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Message Pair Component (User + AI Response)
interface MessagePairProps {
  message: Message;
  onRetryUser?: () => void;
  onEditUser?: () => void;
  onCopyUser?: () => void;
  onRetryAI?: () => void;
  onCopyAI?: () => void;
  onBranchAI?: () => void;
}

export const MessagePair: React.FC<MessagePairProps> = ({
  message,
  onRetryUser,
  onEditUser,
  onCopyUser,
  onRetryAI,
  onCopyAI,
  onBranchAI,
}) => {
  const [responseIndex, setResponseIndex] = useState(0);
  const aiContent = message?.aiResponse?.[responseIndex]?.content || "";
  return (
    <div className="space-y-16">
      <UserMessage
        content={message.userQuery}
        attachmentUrl={message.attachment}
        messageId={message._id}
        onEdit={onEditUser}
        onCopy={onCopyUser}
      />
      <AIResponse
        content={aiContent}
        message={message}
        totalResponses={message.aiResponse?.length || 0}
        responseIndex={responseIndex}
        setResponseIndex={setResponseIndex}
        messageId={message._id}
        onCopy={onCopyAI}
        onBranch={onBranchAI}
      />
    </div>
  );
};
