"use client";

import { Textarea } from "@/components/ui/TextArea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const PromptInputContext = createContext({
  isLoading: false,
  value: "",
  onChange: (_e: React.ChangeEvent<HTMLTextAreaElement>) => {},
  maxHeight: 240,
  onSubmit: () => {},
  disabled: false,
});

function usePromptInput() {
  const context = useContext(PromptInputContext);
  if (!context) {
    throw new Error("usePromptInput must be used within a PromptInput");
  }
  return context;
}

type PromptInputProps = {
  className: string;
  loading: boolean;
  maxHeight?: number;
  value: string;
  onChange: (_e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  disabled: boolean;
  // response: string;
  children: React.ReactNode;
};

function PromptInput({
  className,
  loading = false,
  maxHeight = 240,
  value,
  onChange,
  onSubmit,
  disabled = false,
  children,
  // response,
}: PromptInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  console.log(value.trim());
  return (
    <TooltipProvider>
      <PromptInputContext.Provider
        value={{
          isLoading: loading,
          value,
          onChange,
          maxHeight,
          onSubmit,
          disabled,
        }}
      >
        <motion.div
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          animate={{
            boxShadow:
              isFocused && value.trim()
                ? "0 0 0 1.5px #F59E0B, 0 0 15px 5px #F59E0B40"
                : "none",
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "relative rounded-3xl p-2 transition-colors duration-300",
            isFocused && value.trim()
              ? "shimmer-active border-transparent bg-black"
              : "border border-neutral-700 bg-neutral-900",
            className
          )}
        >
          {children}
        </motion.div>
      </PromptInputContext.Provider>
    </TooltipProvider>
  );
}

type PromptInputTextareaProps = {
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disableAutosize?: boolean;
  placeholder?: string;
};

function PromptInputTextarea({
  className,
  onKeyDown,
  disableAutosize = false,
  placeholder = "What's on your mind?",

  ...props
}: PromptInputTextareaProps) {
  const { value, maxHeight, onSubmit, disabled, onChange, isLoading } =
    usePromptInput();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (disableAutosize) return;

    if (!textareaRef.current) return;
    textareaRef.current?.focus();
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      typeof maxHeight === "number"
        ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
        : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
  }, [value, maxHeight, disableAutosize]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      onSubmit?.();
    }
    onKeyDown?.(e);
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange?.(e)}
      onKeyDown={handleKeyDown}
      className={cn(
        `min-h-[80px] w-full resize-none border-none bg-transparent font-semibold text-white shadow-none outline-none placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0`,
        className
      )}
      rows={1}
      placeholder={placeholder}
      disabled={disabled} //....
      {...props}
    />
  );
}

type PromptInputActionsProps = {
  children: React.ReactNode;
  className: string;
};

function PromptInputActions({
  children,
  className,
  ...props
}: PromptInputActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

type PromptInputActionProps = {
  tooltip?: string;
  disabled?: boolean;
  // isDropOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  // tooltipOpen?: boolean;
  // setTooltipOpen?: (prev: boolean) => void;
};

function PromptInputAction({
  tooltip,
  disabled,
  children,
  className = "bg-neutral-800 text-white border border-neutral-600",
  side = "top",
  // isDropOpen,
  // tooltipOpen,
  // setTooltipOpen,
  ...props
}: PromptInputActionProps) {
  // const { disabled } = usePromptInput();
  // const []

  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild disabled={disabled}>
        {children}
      </TooltipTrigger>
      {!disabled && (
        <TooltipContent side={side} className={className}>
          {tooltip}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
};
