"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

export function PlaceholdersAndVanishInput({
  placeholders,
  value = "",
  onChange = () => {},
  onSubmit = () => {},
  disabled = false,
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const intervalRef = useRef(null);

  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  };

  useEffect(() => {
    startAnimation();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [placeholders]);

  const inputRef = useRef(null);
  const [animating, setAnimating] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !animating) {
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAnimating(true);
    setTimeout(() => {
      onChange({ target: { value: "" } });
      setAnimating(false);
    }, 1000);
    onSubmit(e);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative mx-auto h-12 w-full overflow-hidden rounded-full bg-white shadow-md transition duration-200 dark:bg-white ${
        value ? "bg-gray-50" : ""
      }`}
    >
      <input
        onChange={onChange}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        value={value}
        type="text"
        className={`relative z-50 h-full w-full rounded-full border-2 border-green-600 bg-transparent pr-20 pl-4 text-sm font-semibold text-black focus:outline-none sm:pl-10 sm:text-base dark:text-black ${
          animating ? "text-transparent dark:text-transparent" : ""
        }`}
        disabled={disabled}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center rounded-full">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
              key={`current-placeholder-${currentPlaceholder}`}
              className="w-full truncate pl-4 text-sm font-normal text-neutral-500 sm:pl-12 sm:text-base dark:text-zinc-500"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
