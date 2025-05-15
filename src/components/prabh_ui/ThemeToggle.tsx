// src/components/prabh_ui/ThemeToggle.tsx
"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react"; // Using lucide icons

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Effect to check localStorage and system preference on initial load
  useEffect(() => {
    const storedTheme = localStorage.getItem("prabh-theme");
    if (storedTheme) {
      setIsDarkMode(storedTheme === "dark");
    } else {
      // Fallback to system preference if no theme is stored
      setIsDarkMode(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // Effect to apply the theme class and save preference to localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("prabh-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("prabh-theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="p-2 rounded-md hover:bg-prabh-accent/20 dark:hover:bg-dark_prabh-accent/20 transition-colors focus:outline-none focus:ring-2 focus:ring-prabh-primary dark:focus:ring-dark_prabh-primary"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? 
        <Sun className="h-5 w-5 text-dark_prabh-accent" /> : 
        <Moon className="h-5 w-5 text-prabh-secondary" />
      }
    </button>
  );
}
