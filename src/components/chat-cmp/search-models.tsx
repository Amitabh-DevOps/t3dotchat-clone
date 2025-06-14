"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Gem,
  Info,
  Eye,
  FileText,
  Brain,
  Key,
  ChevronUp,
  Filter,
  Pin,
  PinOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LuChevronDown, LuFilter } from "react-icons/lu";
import ModelFilters from "./model-filters";
import { useState } from "react";
import { model } from "mongoose";

const ModelCard: React.FC<{
  model: string;
  subModel: string;
  features: string[];
  disabled?: boolean;
}> = ({ model, subModel, features, disabled = false }) => {
  return (
    <div className="group relative">
      <div className="absolute -left-1.5 -top-1.5 z-10 rounded-full bg-popover p-0.5" />
      <Button
        variant="outline"
        className={`group relative flex h-[148px] w-[108px] flex-col items-start gap-0.5 overflow-hidden rounded-xl border border-chat-border/50 bg-sidebar/20 px-1 py-3 text-color-heading [--model-muted:hsl(var(--muted-foreground)/0.9)] [--model-primary:hsl(var(--color-heading))] hover:bg-accent/30 hover:text-color-heading dark:border-chat-border dark:bg-[hsl(320,20%,2.9%)] dark:[--model-muted:hsl(var(--color-heading))] dark:[--model-primary:hsl(var(--muted-foreground)/0.9)] dark:hover:bg-accent/30`}
        disabled={disabled}
      >
        <div className="flex w-full flex-col items-center justify-center gap-1 font-medium transition-colors ">
          <svg
            className="size-7 text-[--model-primary]"
            viewBox="0 0 46 32"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <title>Anthropic</title>
            <path d="M32.73 0h-6.945L38.45 32h6.945L32.73 0ZM12.665 0 0 32h7.082l2.59-6.72h13.25l2.59 6.72h7.082L19.929 0h-7.264Zm-.702 19.337 4.334-11.246 4.334 11.246h-8.668Z"></path>
          </svg>
          <div className="w-full text-center text-[--model-primary]">
            <div className="text-base font-semibold">{model}</div>
            <div className="-mt-0.5 text-sm font-semibold">{subModel}</div>
          </div>
        </div>
      </Button>
      <div
        className={`absolute opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 -right-1.5 -top-4 left-auto z-50 flex w-auto translate-y-2  items-center rounded-[10px] border border-chat-border/40 bg-card p-1 text-xs text-muted-foreground  transition-all `}
      >
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer rounded-md bg-accent/30 hover:bg-muted/50 disabled:cursor-not-allowed "
          tabIndex={-1}
          aria-label="Pin thread"
        >
          <Pin className="lucide lucide-pin-off size-4" />
        </Button>
      </div>
    </div>
  );
};

const models = [
  {
    id: 1,
    name: "Claude 4 Sonnet",
    icon: (
      <svg
        className="size-4 text-foreground"
        viewBox="0 0 46 32"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <title>Anthropic</title>
        <path d="M32.73 0h-6.945L38.45 32h6.945L32.73 0ZM12.665 0 0 32h7.082l2.59-6.72h13.25l2.59 6.72h7.082L19.929 0h-7.264Zm-.702 19.337 4.334-11.246 4.334 11.246h-8.668Z" />
      </svg>
    ),
    badge: <Gem className="size-3 text-muted-foreground" />,
    capabilities: [
      {
        icon: <Eye className="h-4 w-4" />,
        color: "hsl(168 54% 52%)",
        colorDark: "hsl(168 54% 74%)",
      },
      {
        icon: <FileText className="h-4 w-4" />,
        color: "hsl(237 55% 57%)",
        colorDark: "hsl(237 75% 77%)",
      },
    ],
  },
  {
    id: 2,
    name: "Claude 4 Sonnet (Reasoning)",
    icon: (
      <svg
        className="size-4 text-foreground"
        viewBox="0 0 46 32"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <title>Anthropic</title>
        <path d="M32.73 0h-6.945L38.45 32h6.945L32.73 0ZM12.665 0 0 32h7.082l2.59-6.72h13.25l2.59 6.72h7.082L19.929 0h-7.264Zm-.702 19.337 4.334-11.246 4.334 11.246h-8.668Z" />
      </svg>
    ),
    badge: <Gem className="size-3 text-muted-foreground" />,
    capabilities: [
      {
        icon: <Eye className="h-4 w-4" />,
        color: "hsl(168 54% 52%)",
        colorDark: "hsl(168 54% 74%)",
      },
      {
        icon: <FileText className="h-4 w-4" />,
        color: "hsl(237 55% 57%)",
        colorDark: "hsl(237 75% 77%)",
      },
      {
        icon: <Brain className="h-4 w-4" />,
        color: "hsl(263 58% 53%)",
        colorDark: "hsl(263 58% 75%)",
      },
    ],
  },
  {
    id: 2,
    name: "Claude 4 Sonnet (Reasoning)",
    icon: (
      <svg
        className="size-4 text-foreground"
        viewBox="0 0 46 32"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <title>Anthropic</title>
        <path d="M32.73 0h-6.945L38.45 32h6.945L32.73 0ZM12.665 0 0 32h7.082l2.59-6.72h13.25l2.59 6.72h7.082L19.929 0h-7.264Zm-.702 19.337 4.334-11.246 4.334 11.246h-8.668Z" />
      </svg>
    ),
    badge: <Gem className="size-3 text-muted-foreground" />,
    capabilities: [
      {
        icon: <Eye className="h-4 w-4" />,
        color: "hsl(168 54% 52%)",
        colorDark: "hsl(168 54% 74%)",
      },
      {
        icon: <FileText className="h-4 w-4" />,
        color: "hsl(237 55% 57%)",
        colorDark: "hsl(237 75% 77%)",
      },
      {
        icon: <Brain className="h-4 w-4" />,
        color: "hsl(263 58% 53%)",
        colorDark: "hsl(263 58% 75%)",
      },
    ],
  },
  {
    id: 2,
    name: "Claude 4 Sonnet (Reasoning)",
    icon: (
      <svg
        className="size-4 text-foreground"
        viewBox="0 0 46 32"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <title>Anthropic</title>
        <path d="M32.73 0h-6.945L38.45 32h6.945L32.73 0ZM12.665 0 0 32h7.082l2.59-6.72h13.25l2.59 6.72h7.082L19.929 0h-7.264Zm-.702 19.337 4.334-11.246 4.334 11.246h-8.668Z" />
      </svg>
    ),
    badge: <Gem className="size-3 text-muted-foreground" />,
    capabilities: [
      {
        icon: <Eye className="h-4 w-4" />,
        color: "hsl(168 54% 52%)",
        colorDark: "hsl(168 54% 74%)",
      },
      {
        icon: <FileText className="h-4 w-4" />,
        color: "hsl(237 55% 57%)",
        colorDark: "hsl(237 75% 77%)",
      },
      {
        icon: <Brain className="h-4 w-4" />,
        color: "hsl(263 58% 53%)",
        colorDark: "hsl(263 58% 75%)",
      },
    ],
  },
  {
    id: 2,
    name: "Claude 4 Sonnet (Reasoning)",
    icon: (
      <svg
        className="size-4 text-foreground"
        viewBox="0 0 46 32"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <title>Anthropic</title>
        <path d="M32.73 0h-6.945L38.45 32h6.945L32.73 0ZM12.665 0 0 32h7.082l2.59-6.72h13.25l2.59 6.72h7.082L19.929 0h-7.264Zm-.702 19.337 4.334-11.246 4.334 11.246h-8.668Z" />
      </svg>
    ),
    badge: <Gem className="size-3 text-muted-foreground" />,
    capabilities: [
      {
        icon: <Eye className="h-4 w-4" />,
        color: "hsl(168 54% 52%)",
        colorDark: "hsl(168 54% 74%)",
      },
      {
        icon: <FileText className="h-4 w-4" />,
        color: "hsl(237 55% 57%)",
        colorDark: "hsl(237 75% 77%)",
      },
      {
        icon: <Brain className="h-4 w-4" />,
        color: "hsl(263 58% 53%)",
        colorDark: "hsl(263 58% 75%)",
      },
    ],
  },
  {
    id: 3,
    name: "DeepSeek R1 (Llama Distilled)",
    icon: (
      <svg
        className="size-4 text-foreground"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <title>DeepSeek</title>
        <path d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z" />
      </svg>
    ),
    badge: null,
    capabilities: [
      {
        icon: <Brain className="h-4 w-4" />,
        color: "hsl(263 58% 53%)",
        colorDark: "hsl(263 58% 75%)",
      },
    ],
  },
];

export default function SearchModels() {
  const [isAll, setIsAll] = useState(false);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className=" gap-2">
          Gemini 2.5 Flash <LuChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "min-w-[8rem] ",
          "max-w-[calc(100vw-2rem)] !h-fit transition-all p-2 py-1 flex flex-col  gap-2 max-sm:mx-4 max-h-[calc(100vh-80px)]",
          isAll ? "w-[650px]" : "w-[420px]"
        )}
        side="top"
        align="start"
        style={{ height: "616px" }}
      >
        <div className="border-b border-chat-border bg-popover px-1 pt-0.5 sm:inset-x-0">
          <div className="flex items-center">
            <Search className="ml-px mr-3 size-4 text-muted-foreground !text-[14px]" />
            <input
              role="searchbox"
              aria-label="Search threads"
              placeholder="Search models..."
              className="p-1.5 !outline-none !border-none !bg-transparent flex-1 px-1 pr-12 !text-[14px]"
            />
          </div>
        </div>
        <div className="max-h-full flex-1 overflow-y-scroll px-1.5">
          <div className="rounded-xl text-card-foreground border-0 bg-popover  py-2.5 ">
            <div className="flex flex-col space-y-3 rounded-md bg-popover background-reflect border-reflect p-5">
              <h3 className="text-xl font-semibold">
                Unlock all models + higher limits
              </h3>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">$8</span>
                  <span className="text-primary dark:text-primary-foreground">
                    /month
                  </span>
                </div>
                <Button variant="t3">Upgrade now</Button>
              </div>
            </div>
          </div>
          {isAll ? (
            <div className="flex w-full flex-wrap justify-start gap-3.5 pb-4 pl-3 pr-2 pt-2.5">
              <div className="-mb-2 ml-0 flex w-full select-none items-center justify-start gap-1.5 text-color-heading">
                <Pin className="lucide lucide-pin mt-px size-4" />
                Favorites
              </div>
              <ModelCard
                model="Claude"
                subModel="4 Sonnet"
                features={["Vision", "PDFs"]}
                disabled
              />
              <ModelCard
                model="Claude"
                subModel="4 Sonnet"
                features={["Vision", "PDFs", "Reasoning"]}
                disabled
              />
            </div>
          ) : (
            models.map((model) => (
              <div
                key={model.id}
                role="menuitem"
                className="relative select-none rounded-sm text-sm outline-none transition-colors focus:bg-accent/30 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 flex flex-col items-start gap-1 p-3 cursor-not-allowed hover:!bg-transparent [&>*:not(.preserve-hover)]:opacity-50"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex text-nowrap items-center gap-2 pr-2 font-medium text-muted-foreground transition-colors opacity-50">
                    {model.icon}
                    <span className="w-fit">{model.name}</span>
                    {model.badge}
                    <Button variant="ghost" size="icon" className="p-1.5">
                      <Info className="size-3 text-foreground" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {model.capabilities.map((cap, idx) => (
                      <div
                        key={idx}
                        className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-md"
                      >
                        <div className="absolute inset-0 bg-current opacity-20 dark:opacity-15" />
                        {cap.icon}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className=" flex border-t border-t-chat-border items-center justify-between  bg-popover py-1">
          <Button onClick={() => setIsAll(!isAll)} variant="ghost">
            <ChevronUp className={cn("h-4 w-4", isAll ? "-rotate-90" : "")} />
            {isAll ? "Favorites" : "Show all"}
          </Button>
          <ModelFilters />
        </div>
      </PopoverContent>
    </Popover>
  );
}
