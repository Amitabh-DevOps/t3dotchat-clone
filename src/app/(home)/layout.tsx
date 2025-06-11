"use client";
import * as React from "react";
import { IoMdClose } from "react-icons/io";
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
import { LuPin, LuPinOff, LuSettings2 } from "react-icons/lu";
import ThemeToggle from "@/components/global-cmp/theme-toggle";
import Link from "next/link";
import BranchOffIcon from "../../../public/icons/branch-off";

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

      <div className="pointer-events-auto fixed h-fit left-2 top-2 z-50 flex flex-row gap-0.5 p-1 inset-0 right-auto text-muted-foreground rounded-md backdrop-blur-sm transition-[background-color,width] delay-125 duration-125  bg-sidebar blur-fallback:bg-sidebar max-sm:delay-125 max-sm:duration-125 max-sm:w-[6.75rem] max-sm:bg-sidebar">
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
        className={`fixed pointer-events-auto  right-2  top-2 z-50 flex flex-row p-1 items-center justify-center   rounded-md  transition-background ease-snappy   max-sm:w-[6.75rem]   gap-2  text-muted-foreground  ${
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
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <div className="flex items-center justify-center h-8 mt-2 flex-1 *:!text-wordmark-color">
                  <Link href="/">
                    <SidebarLogo />
                  </Link>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button className="w-full" variant="t3">
                  New Chat
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <DevInput
                  className="!w-full gap-3"
                  placeholder="Search your threads..."
                  variant="underline"
                  icon={
                    <FiSearch className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="gap-1">
                <LuPin className="!w-3 !h-3" /> Pinned
              </SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem className="hover:bg-sidebar-accent overflow-hidden flex items-center relative px-0 group/link-item rounded-lg ">
                  <Link className="block p-2 px-3 " href="/">
                    Goodbye Message
                  </Link>
                  <div className="flex *:size-7 bg-sidebar-accent transition-all items-center gap-1 absolute group-hover/link-item:right-1 -right-[100px] ">
                    <Button variant="ghost" size="icon">
                      <LuPinOff />
                    </Button>
                    <Button
                      variant="ghost"
                      className="hover:!bg-destructive/50 hover:!text-destructive-foreground"
                      size="icon"
                    >
                      <IoMdClose />
                    </Button>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Today</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem className="hover:bg-sidebar-accent overflow-hidden flex items-center relative px-0 group/link-item rounded-lg ">
                  <Link className="block p-2 px-3 " href="/">
                    Goodbye Message
                  </Link>
                  <div className="flex *:size-7 bg-sidebar-accent transition-all items-center gap-1 absolute group-hover/link-item:right-1 -right-[100px] ">
                    <Button variant="ghost" size="icon">
                      <LuPin />
                    </Button>
                    <Button
                      variant="ghost"
                      className="hover:!bg-destructive/50 hover:!text-destructive-foreground"
                      size="icon"
                    >
                      <IoMdClose />
                    </Button>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Yesterday</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem className="hover:bg-sidebar-accent overflow-hidden flex items-center relative px-0 group/link-item rounded-lg ">
                  <Link className="block p-2 px-3 " href="/">
                    Goodbye Message
                  </Link>
                  <div className="flex *:size-7 bg-sidebar-accent transition-all items-center gap-1 absolute group-hover/link-item:right-1 -right-[100px] ">
                    <Button variant="ghost" size="icon">
                      <LuPin />
                    </Button>
                    <Button
                      variant="ghost"
                      className="hover:!bg-destructive/50 hover:!text-destructive-foreground"
                      size="icon"
                    >
                      <IoMdClose />
                    </Button>
                  </div>
                </SidebarMenuItem>
                <SidebarMenuItem className="hover:bg-sidebar-accent overflow-hidden flex items-center relative px-0 group/link-item rounded-lg ">
                  <Link className="block p-2 px-3 " href="/">
                    Goodbye Message
                  </Link>
                  <div className="flex *:size-7 bg-sidebar-accent transition-all items-center gap-1 absolute group-hover/link-item:right-1 -right-[100px] ">
                    <Button variant="ghost" size="icon">
                      <LuPin />
                    </Button>
                    <Button
                      variant="ghost"
                      className="hover:!bg-destructive/50 hover:!text-destructive-foreground"
                      size="icon"
                    >
                      <IoMdClose />
                    </Button>
                  </div>
                </SidebarMenuItem>
                <SidebarMenuItem className="hover:bg-sidebar-accent overflow-hidden flex items-center relative px-0 group/link-item rounded-lg ">
                  <Link className="block p-2 px-3 " href="/">
                    Goodbye Message
                  </Link>
                  <div className="flex *:size-7 bg-sidebar-accent transition-all items-center gap-1 absolute group-hover/link-item:right-1 -right-[100px] ">
                    <Button variant="ghost" size="icon">
                      <LuPin />
                    </Button>
                    <Button
                      variant="ghost"
                      className="hover:!bg-destructive/50 hover:!text-destructive-foreground"
                      size="icon"
                    >
                      <IoMdClose />
                    </Button>
                  </div>
                </SidebarMenuItem>
                <SidebarMenuItem className="hover:bg-sidebar-accent overflow-hidden flex items-center relative px-0 group/link-item rounded-lg ">
                  <Link
                    className="p-2 px-3  truncate flex items-center gap-2 "
                    href="/"
                  >
                    <BranchOffIcon />
                    <p className="flex-1/2 truncate">
                      Goodbye Messagedsdsdsdsd dsdsdsdsdsdsdsd
                    </p>
                  </Link>
                  <div className="flex *:size-7 bg-sidebar-accent blur-fallback:bg-sidebar backdrop-blur-sm transition-all items-center gap-1 absolute group-hover/link-item:right-1 -right-[100px] ">
                    <Button variant="ghost" size="icon">
                      <LuPin />
                    </Button>
                    <Button
                      variant="ghost"
                      className="hover:!bg-destructive/50 hover:!text-destructive-foreground"
                      size="icon"
                    >
                      <IoMdClose />
                    </Button>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Yesterday</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem className="hover:bg-sidebar-accent overflow-hidden flex items-center relative px-0 group/link-item rounded-lg ">
                  <Link className="block p-2 px-3 " href="/">
                    Goodbye Message
                  </Link>
                  <div className="flex *:size-7 bg-sidebar-accent transition-all items-center gap-1 absolute group-hover/link-item:right-1 -right-[100px] ">
                    <Button variant="ghost" size="icon">
                      <LuPin />
                    </Button>
                    <Button
                      variant="ghost"
                      className="hover:!bg-destructive/50 hover:!text-destructive-foreground"
                      size="icon"
                    >
                      <IoMdClose />
                    </Button>
                  </div>
                </SidebarMenuItem>
                <SidebarMenuItem className="hover:bg-sidebar-accent overflow-hidden flex items-center relative px-0 group/link-item rounded-lg ">
                  <Link className="block p-2 px-3 " href="/">
                    Goodbye Message
                  </Link>
                  <div className="flex *:size-7 bg-sidebar-accent transition-all items-center gap-1 absolute group-hover/link-item:right-1 -right-[100px] ">
                    <Button variant="ghost" size="icon">
                      <LuPin />
                    </Button>
                    <Button
                      variant="ghost"
                      className="hover:!bg-destructive/50 hover:!text-destructive-foreground"
                      size="icon"
                    >
                      <IoMdClose />
                    </Button>
                  </div>
                </SidebarMenuItem>
                <SidebarMenuItem className="hover:bg-sidebar-accent overflow-hidden flex items-center relative px-0 group/link-item rounded-lg ">
                  <Link className="block p-2 px-3 " href="/">
                    Goodbye Message
                  </Link>
                  <div className="flex *:size-7 bg-sidebar-accent transition-all items-center gap-1 absolute group-hover/link-item:right-1 -right-[100px] ">
                    <Button variant="ghost" size="icon">
                      <LuPin />
                    </Button>
                    <Button
                      variant="ghost"
                      className="hover:!bg-destructive/50 hover:!text-destructive-foreground"
                      size="icon"
                    >
                      <IoMdClose />
                    </Button>
                  </div>
                </SidebarMenuItem>
                <SidebarMenuItem className="hover:bg-sidebar-accent overflow-hidden flex items-center relative px-0 group/link-item rounded-lg ">
                  <Link
                    className="p-2 px-3  truncate flex items-center gap-2 "
                    href="/"
                  >
                    <BranchOffIcon />
                    <p className="flex-1/2 truncate">
                      Goodbye Messagedsdsdsdsd dsdsdsdsdsdsdsd
                    </p>
                  </Link>
                  <div className="flex *:size-7 bg-sidebar-accent blur-fallback:bg-sidebar backdrop-blur-sm transition-all items-center gap-1 absolute group-hover/link-item:right-1 -right-[100px] ">
                    <Button variant="ghost" size="icon">
                      <LuPin />
                    </Button>
                    <Button
                      variant="ghost"
                      className="hover:!bg-destructive/50 hover:!text-destructive-foreground"
                      size="icon"
                    >
                      <IoMdClose />
                    </Button>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem className="flex rounded-lg  p-2.5 mb-2 w-full hover:bg-sidebar-accent min-w-0 flex-row items-center gap-3">
                <img
                  src=""
                  alt=""
                  className="h-8 w-8 bg-accent rounded-full ring-1 ring-muted-foreground/20"
                />
                <div className="flex min-w-0 flex-col text-foreground">
                  <span className="truncate text-sm font-medium">
                    Devyansh Yadav
                  </span>
                  <span className="text-xs">Free</span>
                </div>
              </SidebarMenuItem>
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
