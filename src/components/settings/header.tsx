import React from "react";
import { Button } from "../ui/button";
import { ArrowLeft, Sun } from "lucide-react";
import ThemeToggle from "../global-cmp/theme-toggle";
import Link from "next/link";

const Header = () => {
  return (
    <div className="flex justify-between items-center mb-4">
      <Link href="/">
      <Button variant="ghost" className="t">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Chat
      </Button>
      </Link>
      <div className="flex gap-2">
        <ThemeToggle />
        <Button variant="ghost" className="">
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default Header;
