"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCcw, SquarePen, Copy, Check, GitBranch } from "lucide-react";
import chatStore from "@/stores/chat.store";
import { getMessages } from "@/action/message.action";
import { useIsMutating, useQuery } from "@tanstack/react-query";
import { marked } from "marked";
import { codeToHtml, createCssVariablesTheme, createHighlighter } from "shiki";

// Types
interface Message {
  id: string;
  userQuery: string;
  aiResponse?: Array<{ content: string }>;
}

interface MessageActionsProps {
  onRetry?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onBranch?: () => void;
  showBranch?: boolean;
  showEdit?: boolean;
  modelName?: string;
}

// Reusable Message Actions Component
export const MessageActions: React.FC<MessageActionsProps> = ({
  onRetry,
  onEdit,
  onCopy,
  onBranch,
  showBranch = false,
  showEdit = true,
  modelName,
}) => {
  return (
    <div className="flex items-center gap-1">
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

      {showBranch && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-xs"
          aria-label="Branch off message"
          onClick={onBranch}
          data-state="closed"
        >
          <div className="relative size-4">
            <GitBranch
              className="absolute inset-0 h-4 w-4 transition-[opacity, translate-x] duration-200 ease-snappy scale-100 opacity-100"
              aria-hidden="true"
            />
            <Check
              className="absolute inset-0 h-4 w-4 transition-[opacity, translate-x] duration-200 ease-snappy scale-0 opacity-0"
              aria-hidden="true"
            />
          </div>
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-xs"
        aria-label="Retry message"
        onClick={onRetry}
        data-action="retry"
        data-state="closed"
      >
        <div className="relative size-4">
          <RefreshCcw className="absolute inset-0 h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Retry</span>
        </div>
      </Button>

      {showEdit && (
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

      {modelName && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{modelName}</span>
        </div>
      )}
    </div>
  );
};

// User Message Component
interface UserMessageProps {
  content: string;
  messageId?: string;
  onRetry?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  content,
  messageId,
  onRetry,
  onEdit,
  onCopy,
}) => {
  return (
    <div data-message-id={messageId} className="flex justify-end">
      <div
        role="article"
        aria-label="Your message"
        className="group relative inline-block max-w-[80%] break-words rounded-xl border border-secondary/50 bg-secondary/50 p-3.5 px-4 text-left"
      >
        <span className="sr-only">Your message: </span>
        <div className="flex flex-col gap-3">
          <div className="prose prose-pink max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
            <p>{content || ""}</p>
          </div>
        </div>
        <div className="absolute right-0 mt-5 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
          <MessageActions
            onRetry={onRetry}
            onEdit={onEdit}
            onCopy={onCopy}
            showBranch={false}
            showEdit={true}
          />
        </div>
      </div>
    </div>
  );
};

// Code Block Highlighter Component
const CodeBlockHighlighter = ({
  htmlContent = "",
  lang = "javascript",
  theme = "",
}) => {
  const [processedHtml, setProcessedHtml] = useState("");

  useEffect(() => {
    const highlightCodeBlocks = async () => {
      try {
        // Create a temporary DOM element to parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");
        const myTheme = createCssVariablesTheme({
          name: "css-variables",
          variablePrefix: "--shiki-",
          variableDefaults: {},
          fontStyle: true,
        });
        // Find all code elements within pre tags
        const codeBlocks = doc.querySelectorAll("pre code");
        const highlighter = await createHighlighter({
          langs: ["javascript"],
          themes: [myTheme], // register the theme
        });
        // Process each code block
        for (const codeElement of codeBlocks) {
          const code = codeElement.textContent;
          const highlighted = highlighter.codeToHtml(code || "", {
            lang,
            theme: "css-variables",
          });
          // Replace the code element's content with highlighted HTML
          codeElement.innerHTML =
            highlighted?.match(/<pre[^>]*>([\s\S]*?)<\/pre>/)?.[1] || "";
        }

        // Serialize back to HTML
        const processed = doc.body.innerHTML;
        setProcessedHtml(processed);
      } catch (error) {
        console.error("Error highlighting code blocks:", error);
        setProcessedHtml(htmlContent);
      }
    };

    highlightCodeBlocks();
  }, [htmlContent, lang, theme]);

  return (
    <div className="mark-response">
      <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
    </div>
  );
};

// AI Response Component
interface AIResponseProps {
  content: string;
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
  messageId,
  isStreaming = false,
  isLoading = false,
  modelName = "Gemini 2.5 Flash",
  onRetry,
  onCopy,
  onBranch,
}) => {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    const convertMarkdown = async () => {
      try {
        // Convert Markdown to HTML
        const html = await marked(content || "");
        setHtmlContent(html);
      } catch (error) {
        console.error("Error converting Markdown:", error);
        setHtmlContent(content || "");
      }
    };
    convertMarkdown();
  }, [content]);

  return (
    <div data-message-id={messageId} className="flex justify-start">
      <div className="group relative w-full max-w-full break-words">
        <div
          role="article"
          aria-label="Assistant message"
          className="prose  prose-pink max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0"
        >
          <span className="sr-only">Assistant Reply: </span>
          <div>
            {!content ? (
              <div className="whitespace-pre-wrap">
              <div className="messageLoader"></div> 

              </div>
            ) : isStreaming ? (
              <CodeBlockHighlighter
                htmlContent={htmlContent}
                lang="javascript"
                theme="vitesse-dark"
              />
            ) : (
              <CodeBlockHighlighter
                htmlContent={htmlContent}
                lang="javascript"
                theme="vitesse-dark"
              />
            )}
          </div>
        </div>
        <div className="absolute left-0 -ml-0.5 mt-2 flex w-full flex-row justify-start gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
          <div className="flex w-full flex-row justify-between gap-1 sm:w-auto">
            <MessageActions
              onRetry={onRetry}
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
  const aiContent = message?.aiResponse?.[0]?.content || "";

  return (
    <div className="space-y-16">
      <UserMessage
        content={message.userQuery}
        messageId={message.id}
        onRetry={onRetryUser}
        onEdit={onEditUser}
        onCopy={onCopyUser}
      />
      <AIResponse
        content={aiContent}
        messageId={`${message.id}-response`}
        onRetry={onRetryAI}
        onCopy={onCopyAI}
        onBranch={onBranchAI}
      />
    </div>
  );
};

// Streaming Message Pair Component
interface StreamingMessagePairProps {
  userQuery: string;
  aiResponse: string;
  isLoading: boolean;
  onRetryUser?: () => void;
  onEditUser?: () => void;
  onCopyUser?: () => void;
  onRetryAI?: () => void;
  onCopyAI?: () => void;
  onBranchAI?: () => void;
}

export const StreamingMessagePair: React.FC<StreamingMessagePairProps> = ({
  userQuery,
  aiResponse,
  isLoading,
  onRetryUser,
  onEditUser,
  onCopyUser,
  onRetryAI,
  onCopyAI,
  onBranchAI,
}) => {
  return (
    <div className="space-y-16">
      <UserMessage
        content={userQuery}
        messageId="current-query"
        onRetry={onRetryUser}
        onEdit={onEditUser}
        onCopy={onCopyUser}
      />
      <AIResponse
        content={aiResponse}
        messageId="current-response"
        isStreaming={true}
        isLoading={isLoading}
        onRetry={onRetryAI}
        onCopy={onCopyAI}
        onBranch={onBranchAI}
      />
    </div>
  );
};
