"use client";

// import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { ChevronUp } from "lucide-react";
import { motion } from "motion/react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
// import { useState } from "react";

type ModelDropdownProps = {
  onFlashClick: () => void;
  onImageGenClick: () => void;
  onGroqClick: () => void;
  model: string;
  files: File[];
  isOpen: boolean;
  setIsOpen: (prev: boolean) => void;
  // setIsDropOpen: (prev: boolean) => void;
  // setTooltipOpen: (prev: boolean) => void;
};

export function ModelDropdown({
  onFlashClick,
  onImageGenClick,
  onGroqClick,
  model,
  isOpen,
  files,
  // onClick,
  setIsOpen,
  // setIsDropOpen,
}: // setTooltipOpen,
ModelDropdownProps) {
  // const [isOpen, setIsOpen] = useState(false)
  return (
    <DropdownMenu
      onOpenChange={(open) => {
        // setTooltipOpen(false);
        setIsOpen(open);
        // setIsDropOpen(!open);
      }}
      open={isOpen}
    >
      <DropdownMenuTrigger asChild>
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 0 : 180 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 27,
            mass: 1,
            ease: "easeInOut",
            duration: 0.25,
          }}
          className="origin-center"
        >
          <ChevronUp
            className={`h-8 w-8 text-white transition-all duration-150 ease-in-out hover:bg-neutral-800`}
            strokeOpacity="0.79"
          />
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 translate-y-3 border-2 border-gray-700 bg-black">
        <DropdownMenuLabel className="border-b-2 border-gray-700 font-extralight text-white">
          Choose Model
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          className="text-white hover:bg-gray-800 focus:outline-none"
          checked={model === "gemini-2.0-flash"}
          onClick={onFlashClick}
        >
          Gemini-2.0-flash
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          className="text-white hover:bg-gray-800 focus:outline-none"
          checked={model === "gemini-2.0-flash-exp-image-generation"}
          onClick={onImageGenClick}
          disabled={files.length > 0 ? true : false}
        >
          Gemini-2.0-flash-exp-image-generation
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          className="text-white hover:bg-gray-800 focus:outline-none"
          checked={model === "llama-3.3-70b-versatile"}
          onClick={onGroqClick}
          disabled={files.length > 0 ? true : false}
        >
          Llama-3.3-70b-versatile
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
