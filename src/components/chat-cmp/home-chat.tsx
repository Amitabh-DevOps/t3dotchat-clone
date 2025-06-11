import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import {
  LuCode,
  LuGraduationCap,
  LuNewspaper,
  LuSparkles,
} from "react-icons/lu";

const HomeChat = () => {
  const userName = "User";
  const actionButtons = [
    { label: "Create", value: "create", icon: <LuSparkles /> },
    { label: "Explore", value: "explore", icon: <LuNewspaper /> },
    { label: "Code", value: "code", icon: <LuCode /> },
    { label: "Learn", value: "learn", icon: <LuGraduationCap /> },
  ];

  const presetMessages: { [key: string]: { text: string }[] } = {
    create: [
      { text: "How to design a logo?" },
      { text: "Best tools for digital art?" },
      { text: "Create a poster idea" },
    ],
    explore: [
      { text: "Top travel destinations in 2025?" },
      { text: "Interesting facts about space?" },
      { text: "Wildlife in the Amazon?" },
    ],
    code: [
      { text: "Learn Python basics?" },
      { text: "Best practices for JavaScript?" },
      { text: "Build a simple app?" },
    ],
    learn: [
      { text: "History of the Internet?" },
      { text: "Basics of quantum physics?" },
      { text: "How to learn a new language?" },
    ],
  };

  return (
    <div
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
      className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pb-10 pt-safe-offset-10"
    >
      <div className="flex h-[calc(100vh-20rem)] items-start justify-center">
        <div className="w-full space-y-6 px-2 pt-[20vh] duration-300 animate-in fade-in-50 zoom-in-95 sm:px-8">
          <h2 className="text-3xl font-semibold">
            How can I help you, {userName}?
          </h2>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="flex p-0 flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly bg-transparent">
              {actionButtons.map((tab, index) => (
                <TabsTrigger
                  className="
                justify-center  whitespace-nowrap text-sm transition-colors
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
                disabled:cursor-not-allowed disabled:opacity-50
                [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
                h-9 flex items-center gap-2 rounded-full px-5 py-2 font-semibold
                outline-1 outline-secondary/70 backdrop-blur-xl shadow
                !border-0 border-reflect button-reflect
                bg-background 
                hover:bg-accent hover:text-accent-foreground
                dark:bg-secondary/30 dark:hover:bg-secondary
               data-[state=active]:bg-[rgb(162,59,103)] 
               data-[state=inactive]:before:!p-0 
               data-[state=inactive]:text-secondary-foreground 
               data-[state=inactive]:before:!bg-none 
               data-[state=active]:text-primary-foreground 
               data-[state=active]:shadow 
               data-[state=active]:hover:bg-[#d56698] 
               data-[state=active]:active:bg-[rgb(162,59,103)] 
               data-[state=active]:disabled:hover:bg-[rgb(162,59,103)] 
               data-[state=active]:disabled:active:bg-[rgb(162,59,103)] 
               data-[state=active]:dark:bg-primary/20 
               data-[state=active]:dark:hover:bg-pink-800/70 
               data-[state=active]:dark:active:bg-pink-800/40 
               data-[state=active]:disabled:dark:hover:bg-primary/20 
               data-[state=active]:disabled:dark:active:bg-primary/20
              "
                  key={index}
                  value={tab.value}
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {actionButtons.map((tab) => (
              <TabsContent className="mt-5" key={tab.value} value={tab.value}>
                <div className="flex flex-col text-foreground">
                  {presetMessages[tab.value].map((message, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 border-t border-secondary/40 py-1 first:border-none"
                    >
                      <button className="w-full rounded-md py-2 text-left text-secondary-foreground hover:bg-secondary/50 sm:px-3">
                        <span>{message.text}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default HomeChat;
