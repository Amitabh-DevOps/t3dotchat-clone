import React from "react";
import { Button } from "../ui/button";
import { ArrowLeft, Sun } from "lucide-react";

const Header = () => {
  return (
    <div className="flex justify-between items-center mb-4">
      <Button variant="ghost" className="text-zinc-400 hover:text-white">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Chat
      </Button>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white"
        >
          <Sun className="w-4 h-4" />
        </Button>
        <Button variant="ghost" className="text-zinc-400 hover:text-white">
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default Header;
