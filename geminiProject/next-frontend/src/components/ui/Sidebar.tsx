"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { LogoSVG } from "@/components/ui/LogoSVG";
import { useAuth } from "@/hooks/use-auth";
import { GUEST_COPY, formatGuestUsage } from "@/lib/guest/guest-copy";
import { motion } from "motion/react";
import {
  PanelRightClose,
  PanelLeftClose,
  ChevronsLeftRight,
  Search,
  MessageSquarePlus,
  Images,
  ChevronDown,
  User,
  BadgeDollarSign,
  LogOut,
} from "lucide-react";
import { ConditionalTooltip } from "./ConditionalTooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  guestRemainingAttemptsAtom,
  guestUsageSnapshotAtom,
  syncGuestUsageAtom,
} from "@/stores/GuestStore";
import toast from "react-hot-toast";

interface SidebarProps {
  isCollapsible: boolean;
  setIsCollapsible: (value: boolean) => void;
}

export const Sidebar = ({ isCollapsible, setIsCollapsible }: SidebarProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isHoverable, setIsHoverable] = useState(false);
  const [isChatsExpanded, setIsChatsExpanded] = useState(false);
  const { user, isAuthenticated, isAuthLoading, isLoggingOut, logout } =
    useAuth();
  const isGuestMode = !isAuthenticated && !isAuthLoading;
  const guestUsage = useAtomValue(guestUsageSnapshotAtom);
  const guestRemainingAttempts = useAtomValue(guestRemainingAttemptsAtom);
  const syncGuestUsage = useSetAtom(syncGuestUsageAtom);

  const accountInitials =
    user?.name
      ?.split(" ")
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  useEffect(() => {
    syncGuestUsage();

    const storedSidebarState = window.localStorage.getItem("sidebar-open");
    if (storedSidebarState !== null) {
      setIsOpen(storedSidebarState === "true");
    }
  }, [syncGuestUsage]);

  useEffect(() => {
    window.localStorage.setItem("sidebar-open", String(isOpen));
  }, [isOpen]);

  const handleClick = () => {
    if (!isOpen) {
      setIsOpen(!isOpen);
    } else {
      return;
    }
    setIsHoverable(false);
  };

  const handleSignOut = async () => {
    if (isLoggingOut) return;

    try {
      await logout();
      toast.success("Signed out successfully.");
      router.refresh();
    } catch {
      toast.error("Unable to sign out. Please try again.");
    }
  };

  const springTransitions = {
    default: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
      mass: 0.8,
    },
    sidebar: {
      type: "spring" as const,
      stiffness: 250,
      damping: 20,
      mass: 1,
    },
    children: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
    },
    chevron: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  };

  const sideVariants = {
    open: {
      width: "272px",
    },
    closed: {
      width: "64px",
    },
  };

  const parentVars = {
    open: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        // staggerDirection: -1,
        delayChildren: 0,
      },
    },
  };

  const childVars = {
    open: {
      opacity: 1.02,
      y: 3,
      scale: 1,
    },
    closed: {
      opacity: 1,
      y: -10,
      scale: 0.95,
    },
  };

  const links = [
    {
      name: "New Chat",
      href: "/new-chat",
      icon: (
        <ConditionalTooltip
          content="New Chat"
          side="right"
          showTooltip={!isOpen}
        >
          <MessageSquarePlus className="h-6 w-6" />
        </ConditionalTooltip>
      ),
    },
    {
      name: "Search",
      href: "/search",
      icon: (
        <ConditionalTooltip content="Search" side="right" showTooltip={!isOpen}>
          <Search className="h-6 w-6" />
        </ConditionalTooltip>
      ),
    },
    {
      name: "Library",
      href: "/library",
      icon: (
        <ConditionalTooltip
          content="Library"
          side="right"
          showTooltip={!isOpen}
        >
          <Images className="h-6 w-6" />
        </ConditionalTooltip>
      ),
    },
  ];

  const visibleLinks = isGuestMode
    ? links.filter((link) => link.name === "New Chat")
    : links;

  return !isCollapsible ? (
    <motion.div
      initial={false}
      animate={isOpen ? "open" : "closed"}
      transition={springTransitions.sidebar}
      exit="closed"
      onClick={handleClick}
      className={`${
        !isOpen && "cursor-e-resize"
      } relative z-30 h-screen overflow-visible bg-sidebar/95 text-sidebar-foreground`}
    >
      <motion.nav
        variants={sideVariants}
        transition={springTransitions.default}
        className={`flex h-full flex-col items-center ${
          isOpen ? "bg-sidebar" : ""
        }`}
      >
        <motion.div className="flex h-20 w-full flex-shrink-0 items-center gap-28 p-2">
          <ConditionalTooltip
            content="Toggle Sidebar"
            side="right"
            showTooltip={!isOpen}
            className="ml-0"
          >
            <button
              onClick={handleClick}
              onMouseLeave={!isOpen ? () => setIsHoverable(false) : undefined}
              onMouseEnter={!isOpen ? () => setIsHoverable(true) : undefined}
              className={`flex h-12 w-12 items-center justify-center rounded-lg px-2 transition-all ease-in-out hover:bg-sidebar-accent ${
                isOpen && ""
              }`}
            >
              {isHoverable && !isOpen && (
                <PanelRightClose className="h-7 w-7 text-sidebar-foreground" />
              )}
              {(!isHoverable || isOpen) && (
                <LogoSVG className="transition-colors duration-200" />
              )}
            </button>
          </ConditionalTooltip>

          {isOpen && (
            <div className="flex w-1/3 items-center space-x-3">
              <ConditionalTooltip
                content="Collapse Sidebar"
                side="bottom"
                showTooltip={isOpen}
                className="p-1.5 text-xs"
              >
                <button
                  onClick={() => setIsCollapsible(true)}
                  className="rounded-lg p-2 hover:bg-sidebar-accent"
                >
                  <ChevronsLeftRight className="size-5 text-sidebar-foreground" />
                </button>
              </ConditionalTooltip>

              <ConditionalTooltip
                content="Toggle Sidebar"
                side="bottom"
                showTooltip={isOpen}
                className="p-1.5 text-xs"
              >
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="rounded-lg p-2 hover:bg-sidebar-accent"
                >
                  <PanelLeftClose className="h-6 w-6 text-sidebar-foreground" />
                </button>
              </ConditionalTooltip>
            </div>
          )}
        </motion.div>

        <motion.div
          className={`flex w-full flex-1 flex-col ${isOpen ? "overflow-hidden" : "overflow-visible"}`}
        >
          <motion.div
            variants={parentVars}
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            className={
              isOpen
                ? "mt-2 mb-4 flex w-full flex-col space-y-3 px-2"
                : "relative mt-5 flex w-16 flex-1 flex-col items-center"
            }
          >
            {isOpen
              ? visibleLinks.map((link, index) => (
                  <motion.button
                    key={index}
                    initial="closed"
                    animate={isOpen ? "open" : "closed"}
                    variants={childVars}
                    className="h-10 w-full rounded-3xl transition-colors duration-200 hover:bg-sidebar-accent"
                  >
                    <span className="ml-1 flex items-center space-x-3 p-2 text-sidebar-foreground">
                      {link.icon}
                      <span className="-translate-y-[2.5px] font-sans text-[16px]">
                        {link.name}
                      </span>
                    </span>
                  </motion.button>
                ))
              : visibleLinks.map((link, index) => (
                  <motion.button
                    key={index}
                    initial="closed"
                    animate={isOpen ? "open" : "closed"}
                    variants={childVars}
                    className="rounded-lg p-3 transition-colors duration-200 hover:bg-sidebar-accent"
                  >
                    {link.icon}
                  </motion.button>
                ))}
            {!isOpen && (
              <div className="absolute bottom-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary">
                {isGuestMode || isAuthLoading ? (
                  <User className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <span className="text-xs font-semibold text-primary-foreground">
                    {accountInitials}
                  </span>
                )}
              </div>
            )}
          </motion.div>

          {isOpen && isAuthenticated && (
            <div className="flex w-full flex-1 flex-col overflow-hidden px-2">
              <div className="flex h-[396px] w-full flex-col">
                <button
                  onClick={() => setIsChatsExpanded(!isChatsExpanded)}
                  className="flex w-full flex-shrink-0 items-center justify-between rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span className="text-[16px] font-medium">Chats</span>
                  <motion.div
                    animate={{ rotate: isChatsExpanded ? 180 : 0 }}
                    transition={springTransitions.chevron}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>

                {isChatsExpanded && (
                  <motion.div
                    initial={false}
                    animate={isChatsExpanded ? "open" : "closed"}
                    variants={parentVars}
                    className="custom-scrollbar mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto"
                  >
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-sidebar-foreground/90 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      Chat with AI Assistant
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-sidebar-foreground/90 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      Project Discussion
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-sidebar-foreground/90 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      Code Review Session
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-sidebar-foreground/90 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      Bug Investigation
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-sidebar-foreground/90 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      Feature Planning
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-sidebar-foreground/90 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      Documentation Review
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-sidebar-foreground/90 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      API Integration Chat
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-sidebar-foreground/90 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      Database Design Discussion
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-sidebar-foreground/90 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      Bug Investigation
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-sidebar-foreground/90 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      Feature Planning
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {isOpen && (
          <div className="absolute bottom-0 left-0 w-full border-t border-sidebar-border bg-sidebar-accent/60">
            <div className="space-y-3 p-3">
              {isAuthLoading ? (
                <div className="rounded-xl border border-sidebar-border/60 bg-sidebar p-3">
                  <p className="text-sm font-medium text-sidebar-foreground">
                    Checking your session...
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Loading your account details.
                  </p>
                </div>
              ) : isGuestMode ? (
                <div className="space-y-3 rounded-xl border border-sidebar-border/60 bg-sidebar p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-sidebar-foreground">
                        Guest access
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {GUEST_COPY.sidebarWelcome}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-sidebar-accent/75 px-2.5 py-2 text-xs text-sidebar-foreground">
                    <p>{formatGuestUsage(guestUsage.usedCount, guestUsage.maxCount)}</p>
                    <p className="text-muted-foreground">
                      {guestRemainingAttempts} free messages left in your 24h window
                    </p>
                  </div>

                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {GUEST_COPY.sidebarBenefits}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      className="rounded-md border border-sidebar-border px-3 py-2 text-center text-xs font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-md bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border/60 bg-sidebar px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {accountInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-sidebar-foreground">
                          {user?.name ?? "Signed in user"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user?.email ?? "No email"}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    side="top"
                    sideOffset={8}
                    className="w-60 border-sidebar-border bg-sidebar text-sidebar-foreground"
                  >
                    <div className="px-2 py-1.5">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="truncate text-sm font-medium">
                        {user?.email ?? "Unknown"}
                      </p>
                    </div>

                    <DropdownMenuSeparator className="bg-sidebar-border" />

                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        toast("Profile page coming soon.");
                      }}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        toast("Pricing page coming soon.");
                      }}
                    >
                      <BadgeDollarSign className="h-4 w-4" />
                      Pricing
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-sidebar-border" />

                    <DropdownMenuItem
                      variant="destructive"
                      disabled={isLoggingOut}
                      onSelect={(event) => {
                        event.preventDefault();
                        void handleSignOut();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? "Signing out..." : "Sign out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )}
      </motion.nav>
    </motion.div>
  ) : null;
};
