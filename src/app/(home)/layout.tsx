import React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import T3Button from "@/components/global-cmp/t3-button";
import Sidebar from "@/components/global-cmp/sidebar";
import ThemeToggle from "@/components/global-cmp/theme-toggle";
import { LuSettings2 } from "react-icons/lu";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResizablePanelGroup className="min-h-screen" direction="horizontal">
      <ResizablePanel
        defaultSize={19}
        minSize={19}
        maxSize={63}
      >
        <Sidebar/>
      </ResizablePanel>
      <ResizableHandle className="bg-transparent" />
      <ResizablePanel minSize={37} defaultSize={81} className="relative">
       
        <div className="p-1 w-full">
          <div
            className="fixed grid place-items-center -right-4 top-0 z-20 h-16 w-32 max-sm:hidden"
            style={{ clipPath: "inset(0px 12px 0px 0px)" }}
          >
            <div className="flex items-center gap-4 pb-2 text-muted-foreground z-50">
            <button><LuSettings2/></button>
            <ThemeToggle/>
            </div>
            <div
              className="group pointer-events-none absolute top-3.5 z-10 -mb-8 h-32 w-full origin-top ease-snappy"
              style={{
                boxShadow: "10px -10px 8px 2px hsl(var(--background))",
              }}
            >
              <svg
                className="absolute  h-9 origin-top-left skew-x-[30deg] overflow-visible"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 128 32"
                xmlSpace="preserve"
              >
                <line
                  stroke="hsl(var(--background))"
                  stroke-width="2px"
                  shape-rendering="optimizeQuality"
                  vector-effect="non-scaling-stroke"
                  stroke-linecap="round"
                  stroke-miterlimit="10"
                  x1="1"
                  y1="0"
                  x2="128"
                  y2="0"
                ></line>
                <path
                  stroke="hsl(var(--chat-border))"
                  className="translate-y-[0.5px]"
                  fill="hsl(var(--background))"
                  shape-rendering="optimizeQuality"
                  stroke-width="1px"
                  stroke-linecap="round"
                  stroke-miterlimit="10"
                  vector-effect="non-scaling-stroke"
                  d="M0,0c5.9,0,10.7,4.8,10.7,10.7v10.7c0,5.9,4.8,10.7,10.7,10.7H128V0"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <div className="border border-chat-border bg-chat-background mt-1.5 h-full  rounded-tl-xl">
          <div className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pb-10 pt-safe-offset-10">
            {children}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ChatLayout;
