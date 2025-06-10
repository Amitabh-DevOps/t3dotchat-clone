import React from "react";

const HomeChat = () => {
    const userName = "User";
    const actionButtons = [
      { label: "Create" },
      { label: "Explore" },
      { label: "Code" },
      { label: "Learn" },
    ];
    const presetMessages = [
      { text: "How does AI work?" },
      { text: "Are black holes real?" },
      { text: 'How many Rs are in the word "strawberry"?' },
      { text: "What is the meaning of life?" },
    ];
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
          <div className="flex flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly">
            {actionButtons.map((button, index) => (
              <button
                key={index}
                className="justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-pink-600/90 disabled:hover:bg-primary h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:outline data-[selected=false]:hover:bg-secondary max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full"
                data-selected="false"
              >
                <div>{button.label}</div>
              </button>
            ))}
          </div>
          <div className="flex flex-col text-foreground">
            {presetMessages.map((message, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default HomeChat;