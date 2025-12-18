"use client";

import { useState } from "react";
import { LogoSVG } from "@/components/ui/LogoSVG";
import { motion } from "motion/react";
import {
  PanelRightClose,
  PanelLeftClose,
  ChevronsLeftRight ,
  Search,
  MessageSquarePlus,
  Images,
  ChevronDown,
  User,
  Settings,
  LogOut,
  MoreHorizontal,
  ChevronsLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "./dropdown-menu";
import { ConditionalTooltip } from "./ConditionalTooltip";

interface SidebarProps {
  isCollapsible: boolean;
  setIsCollapsible: (value: boolean) => void;
}

export const Sidebar = ({ isCollapsible, setIsCollapsible }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHoverable, setIsHoverable] = useState(false);
  const [isChatsExpanded, setIsChatsExpanded] = useState(false);
  const handleClick = () => {
    if (!isOpen) {
      setIsOpen(!isOpen);
    } else {
      return;
    }
    setIsHoverable(false);
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

  return !isCollapsible ? (
    <motion.div
      initial={false}
      animate={isOpen ? "open" : "closed"}
      transition={springTransitions.sidebar}
      exit="closed"
      onClick={handleClick}
      className={`${
        !isOpen && "cursor-e-resize"
      } relative h-screen bg-neutral-900/85`}
    >
      <motion.nav
        variants={sideVariants}
        transition={springTransitions.default}
        className={`flex h-full flex-col items-center ${
          isOpen
            ? "bg-gradient-to-b from-neutral-950 via-neutral-800 to-neutral-950"
            : ""
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
              className={`flex h-12 w-12 items-center justify-center rounded-lg px-2 transition-all ease-in-out hover:bg-neutral-700 ${
                isOpen && ""
              }`}
            >
              {isHoverable && !isOpen && (
                <PanelRightClose className="h-7 w-7 text-white" />
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
                className="p-1.5 text-sm"
              >
                <button
                  onClick={() => setIsCollapsible(true)}
                  className="rounded-lg p-2 hover:bg-neutral-700"
                >
                  <ChevronsLeftRight className="size-5 text-white" />
                </button>
              </ConditionalTooltip>

              <ConditionalTooltip
                content="Toggle Sidebar"
                side="bottom"
                showTooltip={isOpen}
                className="p-1.5 text-sm"
              >
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="rounded-lg p-2 hover:bg-neutral-700"
                >
                  <PanelLeftClose className="h-6 w-6 text-white" />
                </button>
              </ConditionalTooltip>
            </div>
          )}
        </motion.div>

        <motion.div className="flex w-full flex-1 flex-col overflow-hidden">
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
              ? links.map((link, index) => (
                  <motion.button
                    key={index}
                    initial="closed"
                    animate={isOpen ? "open" : "closed"}
                    variants={childVars}
                    className="h-10 w-full rounded-3xl transition-colors duration-200 hover:bg-neutral-700"
                  >
                    <span className="ml-1 flex items-center space-x-3 p-2 text-white">
                      {link.icon}
                      <span className="-translate-y-[2.5px] font-sans text-[16px]">
                        {link.name}
                      </span>
                    </span>
                  </motion.button>
                ))
              : links.map((link, index) => (
                  <motion.button
                    key={index}
                    initial="closed"
                    animate={isOpen ? "open" : "closed"}
                    variants={childVars}
                    className="rounded-lg p-3 transition-colors duration-200 hover:bg-neutral-700"
                  >
                    {link.icon}
                  </motion.button>
                ))}
            {!isOpen && (
              <div className="absolute bottom-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-rose-600">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
          </motion.div>

          {isOpen && (
            <div className="flex w-full flex-1 flex-col overflow-hidden px-2">
              <div className="flex h-[396px] w-full flex-col">
                <button
                  onClick={() => setIsChatsExpanded(!isChatsExpanded)}
                  className="flex w-full flex-shrink-0 items-center justify-between rounded-lg px-3 py-2 text-neutral-300/80 transition-all duration-200 hover:bg-neutral-700/50 hover:text-white"
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
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-neutral-300/95 transition-all duration-150 hover:bg-neutral-700/30 hover:text-white"
                    >
                      Chat with AI Assistant
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-neutral-300/95 transition-all duration-150 hover:bg-neutral-700/30 hover:text-white"
                    >
                      Project Discussion
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-neutral-300/95 transition-all duration-150 hover:bg-neutral-700/30 hover:text-white"
                    >
                      Code Review Session
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-neutral-300/95 transition-all duration-150 hover:bg-neutral-700/30 hover:text-white"
                    >
                      Bug Investigation
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-neutral-300/95 transition-all duration-150 hover:bg-neutral-700/30 hover:text-white"
                    >
                      Feature Planning
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-neutral-300/95 transition-all duration-150 hover:bg-neutral-700/30 hover:text-white"
                    >
                      Documentation Review
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-neutral-300/95 transition-all duration-150 hover:bg-neutral-700/30 hover:text-white"
                    >
                      API Integration Chat
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-neutral-300/95 transition-all duration-150 hover:bg-neutral-700/30 hover:text-white"
                    >
                      Database Design Discussion
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-neutral-300/95 transition-all duration-150 hover:bg-neutral-700/30 hover:text-white"
                    >
                      Bug Investigation
                    </motion.div>
                    <motion.div
                      variants={childVars}
                      className="text-md cursor-pointer rounded-lg px-3 py-2 text-neutral-300/95 transition-all duration-150 hover:bg-neutral-700/30 hover:text-white"
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
          <div className="absolute bottom-0 left-0 w-full border-t border-neutral-700/50 bg-neutral-800/50">
            <div className="p-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-rose-600">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="truncate text-sm font-medium text-white">
                    Shubhankar
                  </div>
                  <div className="truncate text-xs text-neutral-400">
                    shubhankar@gemzy.ai
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded p-1 text-neutral-400 transition-all duration-150 hover:bg-neutral-700/50 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className={`border-neutral-700 bg-slate-900 shadow-lg ${
                      isOpen ? "w-[262px]" : "w-auto"
                    }`}
                    side="top"
                    align="end"
                    sideOffset={12}
                  >
                    <DropdownMenuItem className="cursor-pointer text-white outline-none hover:bg-neutral-700">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-white outline-none hover:bg-neutral-700">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}
      </motion.nav>
    </motion.div>
  ) : null;
};
