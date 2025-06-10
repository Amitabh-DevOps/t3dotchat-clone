import React from "react";
import T3Button from "./t3-button";
import SidebarLogo from "./sidebar-logo";
import { Button } from "../ui/button";
import { FiSearch, FiSidebar } from "react-icons/fi";
import DevInput from "./dev-input";

const Sidebar = () => {
  return (
    <aside className="w-full p-3 space-y-3">
      <div className="flex items-center justify-between text-muted-foreground">
        <Button variant="ghost" size="icon">
          <FiSidebar />
        </Button>
        <div className="grid place-items-center flex-1 pr-8 *:!text-[--wordmark-color]">
          <SidebarLogo />
        </div>
      </div>
      <T3Button>New Chat</T3Button>

      <div>
       <DevInput placeholder="Search your threads..." variant="underline" icon={<FiSearch className="w-3.5 h-3.5 text-muted-foreground ml-2" />}/>  
      </div>
    </aside>
  );
};

export default Sidebar;
