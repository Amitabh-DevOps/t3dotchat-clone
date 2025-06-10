import React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import Sidebar from "@/components/global-cmp/sidebar";
import ChatHeader from "@/components/chat-cmp/chat-header";

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
      <ResizablePanel minSize={37} defaultSize={81} className="relative h-screen flex flex-col">
       
      <ChatHeader/>
        <div className="border flex-1 overflow-hidden border-chat-border bg-chat-background mt-1.5 h-full  rounded-tl-xl">
          <div className="mx-auto relative h-full flex w-full max-w-3xl flex-col space-y-12 px-4 pb-10 pt-safe-offset-10">
            {children}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ChatLayout;
