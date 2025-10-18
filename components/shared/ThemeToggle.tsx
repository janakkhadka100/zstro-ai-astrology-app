// components/shared/ThemeToggle.tsx
// Dark/Light mode toggle component

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getString, type Lang } from "@/lib/utils/i18n";

interface ThemeToggleProps {
  lang: Lang;
  className?: string;
  variant?: "button" | "switch" | "icon";
  showLabel?: boolean;
}

export function ThemeToggle({ 
  lang, 
  className, 
  variant = "button",
  showLabel = true 
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("h-10 w-10 rounded-md bg-muted animate-pulse", className)} />
    );
  }

  const isDark = theme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          "p-2 rounded-md hover:bg-muted transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
        title={getString("toggleTheme", lang)}
        aria-label={getString("toggleTheme", lang)}
      >
        {isDark ? (
          <Sun className="size-5" />
        ) : (
          <Moon className="size-5" />
        )}
      </button>
    );
  }

  if (variant === "switch") {
    return (
      <div className={cn("flex items-center space-x-3", className)}>
        {showLabel && (
          <span className="text-sm font-medium">
            {isDark ? getString("darkMode", lang) : getString("lightMode", lang)}
          </span>
        )}
        <button
          onClick={handleToggle}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isDark ? "bg-primary" : "bg-muted"
          )}
          role="switch"
          aria-checked={isDark}
          aria-label={getString("toggleTheme", lang)}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
              isDark ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={handleToggle}
      className={cn(
        "inline-flex items-center space-x-2 px-3 py-2 rounded-md",
        "bg-muted hover:bg-muted/80 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      aria-label={getString("toggleTheme", lang)}
    >
      {isDark ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? getString("lightMode", lang) : getString("darkMode", lang)}
        </span>
      )}
    </button>
  );
}

// Theme provider wrapper
interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({ 
  children, 
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true 
}: ThemeProviderProps) {
  return (
    <div data-theme-provider>
      {children}
    </div>
  );
}
