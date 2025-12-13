"use client";

import { useTheme } from "@/app/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme } = useTheme();

  return (
    <div className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 transition-colors duration-200">
      <Sun className="h-5 w-5 text-yellow-500 dark:hidden" />
      <Moon className="h-5 w-5 text-blue-400 hidden dark:block" />
    </div>
  );
}
