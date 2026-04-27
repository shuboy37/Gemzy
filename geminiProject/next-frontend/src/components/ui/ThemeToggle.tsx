"use client";

import { useEffect, useState } from "react";
import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { ConditionalTooltip } from "./ConditionalTooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = resolvedTheme ?? theme ?? "light";
  const isDark = activeTheme === "dark";

  if (!mounted) {
    return <div className="size-10 rounded-lg border border-border bg-card/60" />;
  }

  return (
    <DropdownMenu>
      <ConditionalTooltip content="Theme" side="bottom" showTooltip={true}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Toggle theme"
            className={`flex size-10 items-center justify-center rounded-lg border border-border bg-card/60 p-2 transition-all duration-200 ease-in-out hover:bg-accent active:scale-95 active:duration-75 ${className ?? ""}`}
          >
            {isDark ? (
              <Moon className="size-4 text-foreground" />
            ) : (
              <Sun className="size-4 text-foreground" />
            )}
          </button>
        </DropdownMenuTrigger>
      </ConditionalTooltip>

      <DropdownMenuContent
        align="end"
        className="w-40 border-border bg-popover text-popover-foreground"
      >
        <DropdownMenuItem
          onSelect={() => setTheme("light")}
          className="cursor-pointer justify-between"
        >
          <span className="flex items-center gap-2">
            <Sun className="size-4" />
            Light
          </span>
          {activeTheme === "light" && <Check className="size-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => setTheme("dark")}
          className="cursor-pointer justify-between"
        >
          <span className="flex items-center gap-2">
            <Moon className="size-4" />
            Dark
          </span>
          {activeTheme === "dark" && <Check className="size-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
