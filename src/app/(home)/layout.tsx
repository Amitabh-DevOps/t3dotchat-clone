"use client";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import SidebarLogo from "@/components/global-cmp/sidebar-logo";
import { FiPlus, FiSidebar } from "react-icons/fi";
import DevInput from "@/components/global-cmp/dev-input";
import { FiSearch } from "react-icons/fi";
import ChatHeader from "@/components/chat-cmp/chat-header";
import { LuSettings2 } from "react-icons/lu";
import ThemeToggle from "@/components/global-cmp/theme-toggle";

// Create a wrapper component to access sidebar state
function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";

  return (
    <div
      className={` h-screen w-full flex flex-col overflow-hidden transition-all duration-300 ease-snappy ${
        isSidebarCollapsed ? "ml-0" : ""
      }`}
    >
      {/* ChatHeader with conditional transform */}
      <div
        className={`transition-transform z-50 relative duration-300 ease-snappy ${
          isSidebarCollapsed
            ? "-translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div
          className={`transition-transform duration-100 ease-snappy ${
            isSidebarCollapsed
              ? "-translate-y-full opacity-0 pointer-events-none"
              : "translate-y-0 opacity-100  p-1"
          }`}
        >
          <ChatHeader />
        </div>
      </div>

      {/* Main container that adapts to sidebar state */}
      <main
        className={`
         flex-1 overflow-hidden z-20 border-chat-border bg-chat-background 
         transition-all duration-300 ease-snappy
        ${
          isSidebarCollapsed
            ? "mt-0 h-screen" // Full height when sidebar closed
            : "mt-1.5 h-full border rounded-tl-xl" // Normal height when sidebar open
        }
      `}
      >
        <div
          className={`
          mx-auto relative max-w-3xl h-full flex w-full flex-col space-y-12 px-4 pb-10
          transition-all duration-300 ease-snappy
        `}
        >
          {children}
        </div>
      </main>

      <div className="pointer-events-auto fixed h-fit left-1.5 top-1.5 z-50 flex flex-row gap-0.5 p-1 inset-0 right-auto text-muted-foreground rounded-md backdrop-blur-sm transition-[background-color,width] delay-125 duration-125  bg-sidebar blur-fallback:bg-sidebar max-sm:delay-125 max-sm:duration-125 max-sm:w-[6.75rem] max-sm:bg-sidebar">
        <SidebarTrigger />
        <div
          className={`transition-all flex flex-nowrap duration-200 ease-snappy gap-0.5 ${
            isSidebarCollapsed
              ? ""
              : "-translate-x-[20px] opacity-0 w-0 -z-50 h-0"
          }`}
        >
          <Button variant="ghost" size="icon">
            <FiSearch />
          </Button>
          <Button variant="ghost" size="icon">
            <FiPlus />
          </Button>
        </div>
      </div>
      <div
        className={`fixed pointer-events-auto  right-1.5  top-1.5 z-50 flex flex-row p-1 items-center justify-center   rounded-md  transition-background ease-snappy   max-sm:w-[6.75rem]   gap-2  text-muted-foreground  ${
          isSidebarCollapsed ? "bg-sidebar backdrop-blur-sm" : "bg-transparent"
        }`}
      >
        <Button variant="ghost" size="icon">
          <LuSettings2 />
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <Sidebar className="!bg-transparent" collapsible="offcanvas">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="grid place-items-center flex-1 pr-8 *:!text-[--wordmark-color]">
                    <SidebarLogo />
                  </div>
                </div>
              </SidebarMenuItem>
              <br />
              <SidebarMenuItem>
                <Button className="w-full" variant="t3">
                  New Chat
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <DevInput
                  placeholder="Search your threads..."
                  variant="underline"
                  icon={
                    <FiSearch className="w-3.5 h-3.5 text-muted-foreground ml-2" />
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem></SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem></SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Use the wrapper component that has access to sidebar state */}
        <ChatLayoutContent>{children}</ChatLayoutContent>
      </SidebarProvider>
    </>
  );
}
