"use client";

import {
  ChevronsLeftRight,
  Search,
  MessageSquarePlus,
  Images,
} from "lucide-react";
import { ConditionalTooltip } from "./ConditionalTooltip";
import { useAuth } from "@/hooks/use-auth";

interface NavBarProps {
  isCollapsible: boolean;
  setIsCollapsible?: (value: boolean) => void;
}

export const NavBar = ({ isCollapsible, setIsCollapsible }: NavBarProps) => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const isGuestMode = !isAuthenticated && !isAuthLoading;

  if (!isCollapsible) {
    return null;
  }

  const navItems = isGuestMode
    ? [{ label: "New Chat", icon: MessageSquarePlus }]
    : [
        { label: "New Chat", icon: MessageSquarePlus },
        { label: "Search", icon: Search },
        { label: "Library", icon: Images },
      ];

  return (
    <div className="pointer-events-none absolute top-4 left-6 z-40">
      <div className="pointer-events-auto flex h-12 items-center divide-x divide-border overflow-hidden rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur-md">
        <ConditionalTooltip
          content="Expand Sidebar"
          side="bottom"
          showTooltip={true}
        >
          <button
            onClick={() => setIsCollapsible && setIsCollapsible(false)}
            className="flex h-full w-11 cursor-pointer items-center justify-center p-3 text-foreground transition-all duration-200 ease-in-out hover:bg-accent active:scale-95 active:duration-75"
          >
            <ChevronsLeftRight className="size-5" />
          </button>
        </ConditionalTooltip>

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <ConditionalTooltip
              key={item.label}
              content={item.label}
              side="bottom"
              showTooltip={true}
            >
              <button className="flex h-full w-11 cursor-pointer items-center justify-center p-3 text-foreground transition-all duration-200 ease-in-out hover:bg-accent active:scale-95 active:duration-75">
                <Icon className="size-5" />
              </button>
            </ConditionalTooltip>
          );
        })}
      </div>
    </div>
  );
};
