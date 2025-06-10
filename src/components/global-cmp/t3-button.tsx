import React from "react";
import { Button } from "../ui/button";

const T3Button = ({ children }: { children: React.ReactNode }) => {
  return (
    <Button className=" border-reflect button-reflect rounded-lg bg-[rgb(162,59,103)] p-2 font-semibold text-primary-foreground shadow hover:bg-[#d56698] active:bg-[rgb(162,59,103)] disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] dark:bg-primary/20 dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40 w-full ">
      {children}
    </Button>
  );
};

export default T3Button;
