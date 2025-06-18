"use client";
import { useTheme } from "next-themes";
import React, { useEffect } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { Button } from "../ui/button";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };



  return (
    <>
      <Button variant="ghost" size="icon" onClick={toggleTheme}>
        {theme === "light" ? <FiSun /> : <FiMoon className="theme-btn-moon" />}
      </Button>
    </>
  );
};

export default ThemeToggle;
