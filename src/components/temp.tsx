"use client";

import * as React from "react";
import {
  AudioWaveform,
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Forward,
  Frame,
  GalleryVerticalEnd,
  LogOut,
  Map,
  MoreHorizontal,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import SidebarLogo from "./global-cmp/sidebar-logo";
import { FiSidebar } from "react-icons/fi";
import DevInput from "./global-cmp/dev-input";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center justify-between text-muted-foreground">
                  <Button variant="ghost" size="icon">
                    <FiSidebar />
                  </Button>
                  <div className="grid place-items-center flex-1 pr-8 *:!text-[--wordmark-color]">
                    <SidebarLogo />
                  </div>
                </div>
              </SidebarMenuItem>
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
        <div className="border flex-1 overflow-hidden border-chat-border bg-chat-background mt-1.5 h-full  rounded-tl-xl">
          <div className="mx-auto relative h-full flex w-full max-w-3xl flex-col space-y-12 px-4 pb-10 pt-safe-offset-10">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
