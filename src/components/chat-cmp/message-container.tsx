"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
} from "lucide-react";
import chatStore from "@/stores/chat.store";
import { getMessages } from "@/action/message.action";
import { useIsMutating, useQuery } from "@tanstack/react-query";
import { marked } from "marked";
import { codeToHtml, createCssVariablesTheme, createHighlighter } from "shiki";

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
  return (
    <div
      data-message-id={messageId}
      className="flex relative justify-end  items-end flex-col"
    >
      <div
        role="article"
        aria-label="Your message"
        className="group  inline-block max-w-[80%] break-words rounded-xl border border-secondary/50 bg-secondary/50 p-3.5 px-4 text-left"
      >
        <span className="sr-only">Your message: </span>
        <div className="flex flex-col gap-3">
          <div className="prose prose-pink max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
            <p>{content || ""}</p>
          </div>
        </div>
        <div className="absolute right-0 -bottom-10  flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
          <MessageActions
            onRetry={onRetry}
            onEdit={onEdit}
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
            className="object-cover  relative rounded-lg h-full w-full peer-checked:object-contain peer-checked:max-w-full peer-checked:max-h-full"
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
    </div>
  );
};

// Tool Indicator Component
interface ToolIndicatorProps {
  toolName: string;
}

const ToolIndicator: React.FC<ToolIndicatorProps> = ({ toolName }) => {
  const getToolConfig = (name: string) => {
    switch (name.toLowerCase()) {
      case "search tool":
        return {
          icon: <Search className="h-4 w-4" />,
          label: "Searching the web",
          bgColor: "bg-blue-50 dark:bg-blue-950/30",
          borderColor: "border-blue-200 dark:border-blue-800",
          textColor: "text-blue-700 dark:text-blue-300",
        };
      case "weather tool":
        return {
          icon: <Cloud className="h-4 w-4" />,
          label: "Getting weather info",
          bgColor: "bg-sky-50 dark:bg-sky-950/30",
          borderColor: "border-sky-200 dark:border-sky-800",
          textColor: "text-sky-700 dark:text-sky-300",
        };
      default:
        return {
          icon: <RefreshCcw className="h-4 w-4 animate-spin" />,
          label: "Processing",
          bgColor: "bg-gray-50 dark:bg-gray-950/30",
          borderColor: "border-gray-200 dark:border-gray-800",
          textColor: "text-gray-700 dark:text-gray-300",
        };
    }
  };

  const config = getToolConfig(toolName);

  return (
    <div
      className={`t3-tools inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.textColor} text-sm font-medium my-2`}
    >
      {config.icon}
      <span>{config.label}...</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
        <div
          className="w-2 h-2 bg-current rounded-full animate-pulse"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="w-2 h-2 bg-current rounded-full animate-pulse"
          style={{ animationDelay: "0.4s" }}
        ></div>
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

// Enhanced Content Processor to handle T3 tags
const processT3Tags = (
  content: string
): { processedContent: string; hasT3Tags: boolean } => {
  const t3Regex = /<t3>(.*?)<\/t3>/gi;
  const matches = content.match(t3Regex);

  if (!matches) {
    return { processedContent: content, hasT3Tags: false };
  }

  let processedContent = content;
  matches.forEach((match) => {
    const toolName = match.replace(/<\/?t3>/gi, "").trim();
    // Create a placeholder that we'll replace with React component
    const placeholder = `___T3_PLACEHOLDER_${toolName
      .replace(/\s+/g, "_")
      .toUpperCase()}___`;
    processedContent = processedContent.replace(match, placeholder);
  });

  return { processedContent, hasT3Tags: true };
};

// Enhanced AI Response Component
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
  const [t3Tags, setT3Tags] = useState<string[]>([]);

  useEffect(() => {
    const convertMarkdown = async () => {
      try {
        // First, process T3 tags
        const { processedContent, hasT3Tags } = processT3Tags(content || "");

        if (hasT3Tags) {
          // Extract T3 tag content for rendering
          const t3Matches = (content || "").match(/<t3>(.*?)<\/t3>/gi);
          const extractedT3Tags =
            t3Matches?.map((match) => match.replace(/<\/?t3>/gi, "").trim()) ||
            [];
          setT3Tags(extractedT3Tags);
        } else {
          setT3Tags([]);
        }

        // Convert Markdown to HTML (without T3 tags)
        const cleanContent = processedContent.replace(
          /___T3_PLACEHOLDER_[A-Z_]+___/g,
          ""
        );
        const html = await marked(cleanContent);
        setHtmlContent(html);
      } catch (error) {
        console.error("Error converting Markdown:", error);
        setHtmlContent(content || "");
      }
    };
    convertMarkdown();
  }, [content]);

  // Render T3 indicators if they exist
  const renderT3Indicators = () => {
    return t3Tags.map((toolName, index) => (
      <ToolIndicator key={`${toolName}-${index}`} toolName={toolName} />
    ));
  };

  return (
    <div data-message-id={messageId} className="flex justify-start">
      <div className="group relative w-full max-w-full break-words">
        <div
          role="article"
          aria-label="Assistant message"
          className="prose prose-pink max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0"
        >
          <span className="sr-only">Assistant Reply: </span>
          <div>
            {/* Render T3 tool indicators */}
            {isStreaming && t3Tags.length > 0 && (
              <div className="mb-4 t3-tools">{renderT3Indicators()}</div>
            )}

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
        attachmentUrl={message.attachment}
        messageId={message._id}
        onRetry={onRetryUser}
        onEdit={onEditUser}
        onCopy={onCopyUser}
      />
      <AIResponse
        content={aiContent}
        messageId={`${message._id}-response`}
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
