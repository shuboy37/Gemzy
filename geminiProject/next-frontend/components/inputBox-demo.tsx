"use client";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "./ui/InputBox";
import { Button } from "@/components/ui/Button";
import { ArrowUp, ImageUp, Square, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import { ModelDropdown } from "@/components/ui/ReusableUI";

type PromptInputWithActionsProps = {
  model: string;
  setModel: (model: string) => void;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  value: string;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  disabled: boolean;
  // response: string;
};

export function PromptInputWithActions({
  model,
  setModel,
  files,
  setFiles,
  value,
  loading,
  onChange,
  onSubmit,
  disabled,
  // response,
}: PromptInputWithActionsProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  // const [isDropOpen, setIsDropOpen] = useState(true);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
    if (uploadInputRef?.current) {
      uploadInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (uploadInputRef?.current) {
      uploadInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const globalEnterListener = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && files.length > 0 && !loading) {
        e.preventDefault();
        onSubmit?.();
      }
    };
    window.addEventListener("keydown", () => globalEnterListener);
    return () =>
      window.removeEventListener("keydown", () => globalEnterListener);
  }, [files, loading, onSubmit]);
  console.log(model);

  return (
    <PromptInput
      value={value}
      loading={loading}
      onSubmit={onSubmit}
      onChange={onChange}
      disabled={disabled}
      // response={response}
      className="w-full max-w-(--breakpoint-md)"
    >
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm text-pretty text-white"
            >
              <ImageUp
                className={`size-4 rounded-xl ${
                  model !== "gemini-2.0-flash" &&
                  "pointer-events-none cursor-not-allowed"
                }`}
              />
              <span className="max-w-[120px] truncate">{file.name}</span>
              {(() => {
                console.log(file.name);
                return null;
              })()}
              <button
                onClick={() => handleRemoveFile(index)}
                className="rounded-full p-1 hover:bg-black"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <PromptInputTextarea />

      <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-3">
          <PromptInputAction tooltip="Attach files">
            <label
              htmlFor="file-upload"
              className={`flex h-9 w-9 items-center justify-center rounded-md ${
                model === "gemini-2.0-flash"
                  ? "cursor-pointer hover:bg-neutral-800"
                  : "pointer-events-none cursor-not-allowed opacity-50"
              }`}
            >
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                ref={uploadInputRef}
                disabled={model !== "gemini-2.0-flash"}
              />
              <ImageUp className="size-5 text-white" />
            </label>
          </PromptInputAction>
          <PromptInputAction
            tooltip="Choose Model"
            disabled={isOpen}
            // isDropOpen={isDropOpen}
          >
            <div className="h-8 w-8 cursor-pointer rounded-md hover:bg-neutral-800">
              <ModelDropdown
                onFlashClick={() => setModel("gemini-2.0-flash")}
                onImageGenClick={() =>
                  setModel("gemini-2.0-flash-exp-image-generation")
                }
                onGroqClick={() => setModel("llama-3.3-70b-versatile")}
                model={model}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                // setIsDropOpen={setIsDropOpen}
                files={files}
              />
            </div>
          </PromptInputAction>
        </div>

        {(value.trim() || files.length > 0) && (
          <PromptInputAction
            tooltip={loading ? "Stop generation" : "Send message"}
          >
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-full bg-gray-700 fill-current text-white hover:bg-gray-600"
              onClick={onSubmit}
            >
              {loading ? (
                <Square className="size-5 fill-current text-white" />
              ) : (
                <ArrowUp className="size-5 text-white" />
              )}
            </Button>
          </PromptInputAction>
        )}
      </PromptInputActions>
    </PromptInput>
  );
}
