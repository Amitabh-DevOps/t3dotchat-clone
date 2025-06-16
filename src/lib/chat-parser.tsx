import React, { useState, useEffect, useRef } from "react";
import { parse } from "node-html-parser";
import { marked } from "marked";
import { codeToHtml, createCssVariablesTheme, createHighlighter } from "shiki";
import { renderToString } from "react-dom/server";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { LuCopy, LuText } from "react-icons/lu";

// T3 Tag Processor (FIXED VERSION)
export const processSpecificT3Tags = async (
  content: string,
  tagConfigs = {}
) => {
  const html = await marked(content);
  const root = parse(html);

  // Create highlighter for code processing - FIX: Create once and reuse
  const myTheme = createCssVariablesTheme({
    name: "css-variables",
    variablePrefix: "--shiki-",
    variableDefaults: {
      light: "#24292e",
      dark: "#e1e4e8",
      "light-bg": "#ffffff",
      "dark-bg": "#24292e",
    },
    fontStyle: true,
  });

  let highlighter;
  try {
    highlighter = await createHighlighter({
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
        "go",
        "rust",
        "java",
      ],
      themes: [myTheme],
    });
  } catch (error) {
    console.error("Failed to create highlighter:", error);
    // Fallback to no highlighting
    highlighter = null;
  }

  const defaultConfigs = {
    "t3-image": (element: any) => {
      const imageUrl = element.textContent.trim();
      const alt = element.getAttribute("alt") || "Generated image";
      return `<img src="${imageUrl}" class="w-[400px] object-contain aspect-[1/1] h-auto" alt="${alt}" />`;
    },

    pre: async (element: any) => {
      // Get raw content and decode HTML entities
      let codeContent = element.innerHTML.trim();
      const escapeHtml = (text: string) => {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
      };

      // Decode HTML entities
      const htmlDecode = (str: string) => {
        const txt = document.createElement("textarea");
        txt.innerHTML = str;
        return txt.value;
      };

      codeContent = htmlDecode(codeContent);
      // Extract language from class attribute or use default
      const classAttr = element.getAttribute("class") || "";
      const langMatch = classAttr.match(/language-(\w+)/);
      const lang =
        element.getAttribute("lang") ||
        (langMatch ? langMatch[1] : "javascript");

      const title =
        element.getAttribute("title") ||
        lang.charAt(0).toUpperCase() + lang.slice(1);

      let highlighted = `<pre><code class="language-${lang}">${escapeHtml(
        codeContent
      )}</code></pre>`;

      // Helper function to escape HTML for fallback

      // Only try to highlight if highlighter is available
      if (typeof highlighter !== "undefined" && highlighter) {
        try {
          highlighted = await highlighter.codeToHtml(codeContent, {
            lang: lang,
            theme: "css-variables",
          });
        } catch (error) {
          console.error(`Error highlighting ${lang}:`, error);
          // Fall back to plain text with proper escaping
          highlighted = `<pre><code class="language-${lang}">${escapeHtml(
            codeContent
          )}</code></pre>`;
        }
      }

      // Create enhanced code block with header and proper data attributes
      return `
    <div class="enhanced-code-block rounded-md overflow-hidden my-4"" data-lang="${lang}">
      <div class="flex items-center justify-between px-4 py-1 bg-secondary border-b border-border">
        <div class="flex items-center gap-2">
                <span style="font-family: 'consolas', monospace;" class="text-sm font-medium text-foreground">${title}</span>
              </div>
              <div class="flex items-center gap-1">
                       
                          ${renderToString(
                            <Button
                              variant="ghost"
                              size="icon"
                              className="export-btn"
                            >
                              <Download size={16} />
                            </Button>
                          )}
                            ${renderToString(
                              <Button
                                variant="ghost"
                                size="icon"
                                className="wrap-btn"
                              >
                                <LuText size={16} />
                              </Button>
                            )}
                          ${renderToString(
                            <Button
                              variant="ghost"
                              size="icon"
                              className="copy-btn"
                            >
                              <LuCopy size={14} />
                            </Button>
                          )}
                          
                      </div>
      </div>
      <div class="relative code-content !bg-background/60 !border-0 !p-3 !pb-0 !rounded-none !overflow-x-auto">
        ${highlighted.replace(/<pre([^>]*)>/, '<pre$1 class="m-0"')}
      </div>
    </div>
  `;
    },

    // "t3-artifact": (element: any) => {
    //   const artifactContent = element.innerHTML;
    //   const title = element.getAttribute("title") || "Artifact";
    //   const id = element.getAttribute("id") || `artifact-${Date.now()}`;

    //   return `
    //     <div class="t3-artifact border rounded-lg overflow-hidden my-4" data-id="${id}">
    //       <div class="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b">
    //         <h4 class="text-sm font-medium">${title}</h4>
    //       </div>
    //       <div class="p-4">
    //         ${artifactContent}
    //       </div>
    //     </div>
    //   `;
    // },

    "t3-tool": (element: any) => {
      const toolName = element.innerHTML.trim();
      const status = element.getAttribute("status") || "running";
      const icon = getToolIcon(toolName);

      return `
        <div class="t3-tools inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium my-2">
          ${icon}
          <span>${toolName}...</span>
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-current rounded-full animate-pulse"></div>
            <div class="w-2 h-2 bg-current rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-current rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
          </div>
        </div>
      `;
    },

    "t3-gallery": (element: any) => {
      const images = element.querySelectorAll("img, t3-image");
      const columns = element.getAttribute("columns") || "2";

      let galleryHtml = `<div class="t3-gallery grid grid-cols-${columns} gap-4 my-4">`;

      images.forEach((img: any) => {
        const src = img.getAttribute("src") || img.innerHTML?.trim();
        const alt = img.getAttribute("alt") || "Gallery image";
        galleryHtml += `<img src="${src}" alt="${alt}" class="rounded-lg object-cover aspect-square" />`;
      });

      galleryHtml += "</div>";
      return galleryHtml;
    },

    "t3-quote": (element: any) => {
      const quote = element.innerHTML.trim();
      const author = element.getAttribute("author") || "";
      const source = element.getAttribute("source") || "";

      return `
        <blockquote class="t3-quote border-l-4 border-blue-500 pl-4 py-2 my-4 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg">
          <p class="text-lg italic">"${quote}"</p>
          ${
            author
              ? `<cite class="text-sm text-gray-600 dark:text-gray-400">— ${author}${
                  source ? `, ${source}` : ""
                }</cite>`
              : ""
          }
        </blockquote>
      `;
    },
  };

  // Helper function for tool icons
  function getToolIcon(toolName: string) {
    const icons: { [key: string]: string } = {
      search:
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
      weather:
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
      calculator:
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="m9 10 3 3 3-3"/></svg>',
      default:
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    };

    return icons[toolName.toLowerCase()] || icons.default;
  }

  const configs = { ...defaultConfigs, ...tagConfigs };
  const processedTags: any[] = [];

  // Process each configured tag type
  for (const tagName of Object.keys(configs)) {
    const elements = root.querySelectorAll(tagName);

    for (const element of elements) {
      try {
        const replacement = await configs[tagName](element);
        if (replacement) {
          element.replaceWith(replacement);
          processedTags.push({
            tagName,
            content: element.innerHTML,
            attributes: element.attributes,
          });
        }
      } catch (error) {
        console.error(`Error processing ${tagName}:`, error);
        // Keep original element if processing fails
      }
    }
  }

  // IMPORTANT: Process regular markdown code blocks AFTER T3 tags

  return {
    processedHtml: root.toString(),
    processedTags,
    hasProcessedTags: processedTags.length > 0,
  };
};
