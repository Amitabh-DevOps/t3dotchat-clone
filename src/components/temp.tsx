"use client";
import React, { useState, useEffect, useRef } from "react";
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
  Download,
  WrapText,
  Menu,
  CopyCheck,
  CopyCheckIcon,
} from "lucide-react";
import { parse } from 'node-html-parser';
import { marked } from "marked";
import { codeToHtml, createCssVariablesTheme, createHighlighter } from "shiki";
import { renderToString } from "react-dom/server";
import { LuCopy, LuText } from "react-icons/lu";
import { Message as AiMessage } from "ai";
import { useChatStream } from "@/hooks/use-chat-stream";
import { regenerateAnotherResponse } from "@/action/message.action";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import chatStore from "@/stores/chat.store";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

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
  messageId?: string;
  message?: Message;
}

// Reusable Message Actions Component
export const MessageActions: React.FC<MessageActionsProps> = ({
  onRetry,
  onEdit,
  message,
  onCopy,
  onBranch,
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

  const queryClient = useQueryClient();
  const { messages, setMessages } = chatStore();
  const retryMessage = async () => {
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
      if (response.trim() !== "") {
        chatStore.setState({
          messages: messages.map((message) => {
            if (message._id === messageId) {
              return {
                ...message,
                aiResponse: [
                  ...message.aiResponse,
                  { content: response, model: "gpt-3.5-turbo" },
                ],
              };
            }
            return message;
          }),
        });
      }
      setResponseIndex(generateResponse?.data?.aiResponse?.length - 1 || 0);

      // setMessages((prevMessages) => {
      //   return prevMessages.map((message) => {
      //     console.log(message.aiResponse);
      //     if (message._id === messageId) {
      //       return {
      //         ...message,
      //       };
      //     }
      //     return message;
      //   });
      // });
      // queryClient.invalidateQueries({
      //   queryKey: ["thread-messages", params.chatid],
      // });
    } catch (err) {
      console.error("Retry failed:", err);
    }
  };

  return (
    <div className="flex items-center gap-1">
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

// Enhanced Code Block Highlighter Component with Header
// Enhanced Code Block Highlighter Component with Header - WORKING VERSION
const CodeBlockHighlighter = ({
  htmlContent = "",
  lang = "javascript",
  theme = "",
}) => {
  const [processedHtml, setProcessedHtml] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const highlightCodeBlocks = async () => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");
        const myTheme = createCssVariablesTheme({
          name: "css-variables",
          variablePrefix: "--shiki-",
          variableDefaults: {},
          fontStyle: true,
        });

        const codeBlocks = doc.querySelectorAll("pre code");
        const highlighter = await createHighlighter({
          langs: [
            "javascript",
            "typescript",
            "python",
            "html",
            "css",
            "json",
            "xml",
            "sql",
            "bash",
            "yaml",
            "jsx",
            "tsx",
          ],
          themes: [myTheme],
        });

        // Process each code block and wrap with enhanced header
        for (const codeElement of codeBlocks) {
          const code = codeElement.textContent || "";
          const preElement = codeElement.parentElement;

          if (preElement && preElement.tagName === "PRE") {
            // Try to detect language from class or use default
            const className =
              codeElement.className || preElement.className || "";
            const languageMatch = className.match(/language-(\w+)/);
            const detectedLang = languageMatch ? languageMatch[1] : lang;

            // Create the enhanced code block with header
            const enhancedCodeBlock = document.createElement("div");
            enhancedCodeBlock.className =
              "enhanced-code-block rounded-md overflow-hidden my-4";

            // Create header with data attributes for event delegation
            const header = document.createElement("div");
            header.className =
              "flex items-center justify-between px-4 py-1 bg-secondary border-b border-border";
            header.innerHTML = `
              <div class="flex items-center gap-2">
                <span style="font-family: 'consolas', monospace;" class="text-sm font-medium text-foreground">${detectedLang}</span>
              </div>
              <div class="flex items-center gap-1">
              
               
                  ${renderToString(
                    <Button variant="ghost" size="icon" className="export-btn">
                      <Download size={16} />
                    </Button>
                  )}
                    ${renderToString(
                      <Button variant="ghost" size="icon" className="wrap-btn">
                        <LuText size={16} />
                      </Button>
                    )}
                  ${renderToString(
                    <Button variant="ghost" size="icon" className="copy-btn">
                      <LuCopy size={14} />
                    </Button>
                  )}
                  
              </div>
            `;

            // Highlight the code
            const highlighted = highlighter.codeToHtml(code, {
              lang: detectedLang,
              theme: "css-variables",
            });

            // Create code container
            const codeContainer = document.createElement("div");
            codeContainer.className = "relative code-content";
            codeContainer.innerHTML = highlighted;

            // Style the pre element
            const preInContainer = codeContainer.querySelector("pre");
            if (preInContainer) {
              preInContainer.className =
                "m-0 p-4 !bg-background/70 !border-0 !rounded-none code-pre";
              preInContainer.style.whiteSpace = "pre";
              preInContainer.style.overflow = "auto";
            }

            // Assemble the enhanced code block
            enhancedCodeBlock.appendChild(header);
            enhancedCodeBlock.appendChild(codeContainer);

            // Replace the original pre element
            preElement.parentNode?.replaceChild(enhancedCodeBlock, preElement);
          }
        }

        setProcessedHtml(doc.body.innerHTML);
      } catch (error) {
        console.error("Error highlighting code blocks:", error);
        setProcessedHtml(htmlContent);
      }
    };

    if (htmlContent) {
      highlightCodeBlocks();
    }
  }, [htmlContent, lang, theme]);

  // Event delegation for button clicks
  useEffect(() => {
    const container = containerRef.current as any;
    if (!container) return;

    const handleClick = async (e: any) => {
      const target = e.target.closest("button");
      if (!target) return;

      e.preventDefault();
      e.stopPropagation();

      if (target.classList.contains("copy-btn")) {
        const code = decodeURIComponent(target.dataset.code || "");
        try {
          await navigator.clipboard.writeText(code);

          // Visual feedback
          const originalHTML = target.innerHTML;
          target.innerHTML = renderToString(<Check size={16} />);

          setTimeout(() => {
            target.innerHTML = originalHTML;
          }, 2000);
        } catch (err) {
          console.error("Failed to copy text: ", err);
        }
      } else if (target.classList.contains("wrap-btn")) {
        const codeBlock = target.closest(".enhanced-code-block");
        const preElement = codeBlock?.querySelector(".code-pre");

        if (preElement) {
          const currentWhiteSpace = preElement.style.whiteSpace;
          const isCurrentlyWrapped = currentWhiteSpace === "pre-wrap";

          preElement.style.whiteSpace = isCurrentlyWrapped ? "pre" : "pre-wrap";

          if (isCurrentlyWrapped) {
            target.classList.remove("bg-accent");
          } else {
            target.classList.add("bg-accent");
          }
        }
      } else if (target.classList.contains("export-btn")) {
        const code = decodeURIComponent(target.dataset.code || "");
        const lang = target.dataset.lang || "txt";

        try {
          const blob = new Blob([code], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;

          const extensions: { [key: string]: string } = {
            javascript: "js",
            typescript: "ts",
            python: "py",
            java: "java",
            cpp: "cpp",
            c: "c",
            html: "html",
            css: "css",
            json: "json",
            xml: "xml",
            sql: "sql",
            shell: "sh",
            bash: "sh",
            yaml: "yml",
          };

          a.download = `code.${extensions[lang] || "txt"}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (err) {
          console.error("Failed to export file: ", err);
        }
      }
    };

    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("click", handleClick);
    };
  }, [processedHtml]);

  return (
    <div className="mark-response" ref={containerRef}>
      <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
    </div>
  );
};

// Enhanced Content Processor to handle T3 tags
const processT3Tags = (
  content: string
): { processedContent: string; hasT3Tags: boolean } => {
  const t3Regex = /<t3>(.*?)<\/t3>/gi;
  console.log(content, "content");
  const matches = content.match(t3Regex);

  if (!matches) {
    return { processedContent: content, hasT3Tags: false };
  }

  let processedContent = content;
  matches.forEach((match) => {
    const toolName = match.replace(/<\/?t3>/gi, "").trim();
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
        const { processedContent, hasT3Tags } = processT3Tags(content || "");

        if (hasT3Tags) {
          const t3Matches = (content || "").match(/<t3>(.*?)<\/t3>/gi);
          const extractedT3Tags =
            t3Matches?.map((match) => match.replace(/<\/?t3>/gi, "").trim()) ||
            [];
          setT3Tags(extractedT3Tags);
        } else {
          setT3Tags([]);
        }

        const cleanContent = processedContent.replace(
          /___T3_PLACEHOLDER_[A-Z_]+___/g,
          ""
        );
        const html = await marked(cleanContent);
        const t3ImageTags = root.querySelectorAll("t3-image");
        console.log(t3ImageTags, "t3ImageTags");
        t3ImageTags.forEach((t3ImageTag) => {
          const innerHTML = t3ImageTag.innerHTML;
          t3ImageTag.replaceWith(`<custom-element>Hello</custom-element>`);
        });
        const root = parse(html);
        setHtmlContent(root);
      } catch (error) {
        console.error("Error converting Markdown:", error);
        setHtmlContent(content || "");
      }
    };
    convertMarkdown();
  }, [content]);

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
            {isStreaming && t3Tags.length > 0 && (
              <div className="mb-4 t3-tools">{renderT3Indicators()}</div>
            )}

            {!content ? (
              <div className="whitespace-pre-wrap">
                <div className="messageLoader"></div>
              </div>
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
        onRetry={onRetryUser}
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
