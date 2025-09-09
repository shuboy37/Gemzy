"use client";

import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";

type ModelDropdownProps = {
  onFlashClick: () => void;
  onImageGenClick: () => void;
  onGroqClick: () => void;
  model: string;
  files: File[];
  isOpen: boolean;
  setIsOpen: (prev: boolean) => void;
};

export function ModelDropdown({
  onFlashClick,
  onImageGenClick,
  onGroqClick,
  model,
  isOpen,
  files,
  setIsOpen,
}: ModelDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        className="origin-center cursor-pointer"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 1,
            ease: "easeInOut",
            duration: 0.2,
          }}
        >
          <ChevronDown
            className="h-8 w-8 rounded-md p-1 text-white hover:bg-neutral-800"
            strokeOpacity="1"
          />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: -10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: -10,
            }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
            className="absolute top-10 -right-30 z-50 mt-2 w-56 rounded-xl border-2 border-gray-700 bg-black shadow-lg"
          >
            <div className="cursor-default border-b-2 border-gray-700 px-4 py-2">
              <span className="font-extralight text-white">Choose Model</span>
            </div>

            <div className="py-1">
              <motion.div
                whileHover={{ backgroundColor: "rgb(31, 41, 55)" }}
                onClick={() => {
                  onFlashClick();
                  setIsOpen(false);
                }}
                transition={{
                  duration: 0.1,
                  ease: "easeInOut",
                }}
                className="flex cursor-pointer items-center px-4 py-2 text-white"
              >
                <div className="mr-2">
                  {model === "gemini-2.0-flash" && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
                <span>Gemini-2.0-flash</span>
              </motion.div>

              <motion.div
                whileHover={{
                  backgroundColor:
                    files.length > 0 ? "transparent" : "rgb(31, 41, 55)",
                }}
                onClick={() => {
                  if (files.length === 0) {
                    onImageGenClick();
                    setIsOpen(false);
                  }
                }}
                transition={{
                  duration: 0.1,
                  ease: "easeInOut",
                }}
                className={`flex items-center px-4 py-2 text-white ${
                  files.length > 0
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <div className="mr-2">
                  {model === "gemini-2.0-flash-exp-image-generation" && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
                <span>Gemini-2.0-flash-exp-image-generation</span>
              </motion.div>

              <motion.div
                whileHover={{
                  backgroundColor:
                    files.length > 0 ? "transparent" : "rgb(31, 41, 55)",
                }}
                onClick={() => {
                  if (files.length === 0) {
                    onGroqClick();
                    setIsOpen(false);
                  }
                }}
                transition={{
                  duration: 0.1,
                  ease: "easeInOut",
                }}
                className={`flex items-center px-4 py-2 text-white ${
                  files.length > 0
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <div className="mr-2">
                  {model === "llama-3.3-70b-versatile" && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
                <span>Llama-3.3-70b-versatile</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
