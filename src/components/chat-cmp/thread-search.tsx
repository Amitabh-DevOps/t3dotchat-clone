import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Slash, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { RxSlash } from "react-icons/rx";
import { Button } from "../ui/button";
import { FiPlus, FiSearch } from "react-icons/fi";

const recentChats = [
  { id: "ccfc0af3-ffb1-4af4-90e6-ddee838c285e", title: "Greeting Title" },
  { id: "4b4f180e-25c4-4c09-bb66-1c6d1077817f", title: "Greeting Title" },
  {
    id: "6ea46723-95e2-40ea-8dd2-fdcc2a0cc4dc",
    title: "User ending conversation",
  },
  { id: "dfdf", title: "Greeting" },
  { id: "fcb82d1c-f85d-48dd-b87a-f99e42a3cdbf", title: "Greeting" },
  { id: "e96434a9-b7a7-43f4-9bba-e1f9ec2cc164", title: "Greeting" },
  { id: "325d7606-5011-43ed-9452-0ec897ae7842", title: "Greeting Title" },
  {
    id: "2e5190fa-c2fd-4859-8973-e5381b65eecd",
    title: "Title for conversation: dfdfdfdf",
  },
  { id: "ffde8122-004f-4b64-b4ef-a327867f1834", title: "Goodbye message" },
  { id: "bbe39619-2cb2-4852-88bd-0bed3c8ec92f", title: "Greeting" },
];

export default function ThreadSearch() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <FiSearch />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "pointer-events-auto w-full max-w-md rounded-xl bg-popover p-3.5 pt-2.5 text-secondary-foreground shadow-2xl outline gap-1 outline-border/20 backdrop-blur-md sm:max-w-xl"
        )}
      >
        <div className="relative">
          <div className="w-full rounded-t-lg bg-popover">
            <div className="mr-px flex items-center text-[15px] text-muted-foreground justify-between gap-2 pb-2 w-full">
                <div className="w-fit flex items-center">
                    <FiSearch/>
                    <RxSlash className="opacity-20 text-lg" />
                    <FiPlus/>
                </div>
              <input
              className="outline-none !border-none !bg-transparent flex-1 px-1 pr-12 "
                role="searchbox"
                aria-label="Search threads and messages"
                placeholder="Search or press Enter to start new chat..."
              />
            </div>
            <div className="border-b border-chat-border px-3" />
          </div>
        </div>
        <div className="mt-2.5 max-h-[50vh] space-y-2 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <div className="flex w-full items-center justify-start gap-1.5 pl-[3px] text-color-heading  text-sm">
              <Clock className="size-3" />
              Recent Chats
            </div>
            <ul className="flex flex-col gap-0 text-sm text-muted-foreground">
              {recentChats.map((chat) => (
                <li key={chat.id}>
                  <a
                    href={`/chat/${chat.id}`}
                    className="block rounded-md px-2.5 py-2 hover:bg-accent/30 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                    data-discover="true"
                  >
                    {chat.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
