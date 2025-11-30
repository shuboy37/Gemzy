"use client";
import React from "react";
import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/TextArea";
import { Orb } from "@/components/ui/Orb";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_ENTER_COMMAND,
  PASTE_COMMAND,
} from "lexical";
import { FileUpload } from "./ui/FileUpload";
import { useAttachments } from "@/hooks/use-attachments";
import { Chatbox } from "./Chatbox";
import { useGemzyChat } from "@/hooks/use-gemzy-chat";

interface ChatInterfaceProps {}

export default function ChatInterface({}: ChatInterfaceProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { addChatAttachment, attachments, removeAttachment } = useAttachments();
  const [editor] = useLexicalComposerContext();

  // Use the new AI SDK powered hook
  const {
    messages,
    sendWithAttachments,
    isStreaming,
    isReady,
    latestResponse,
    status,
    error,
  } = useGemzyChat();

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const onSubmit = useCallback(
    (text: string) => {
      if (!text.trim() && attachments.length === 0) return;

      sendWithAttachments(text);

      // Clear files state after sending
      setFiles([]);
    },
    [sendWithAttachments, attachments.length]
  );

  const onSubmitHandler = useCallback(() => {
    const text = editor.read(() => $getRoot().getTextContent().trim());

    onSubmit(text);

    // Clear the editor
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      root.append($createParagraphNode());
    });
  }, [editor, onSubmit]);

  const handleAddedFiles = useCallback(
    (newFiles: File[]) => {
      setFiles((prev) => [...prev, ...newFiles]);
      newFiles.forEach(addChatAttachment);
    },
    [addChatAttachment]
  );

  // ==========================================================================
  // EDITOR COMMANDS
  // ==========================================================================

  useEffect(() => {
    // Handle Enter key to submit
    const removeCommand = editor?.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        if (event && !event.shiftKey) {
          event.preventDefault();

          editor.update(() => {
            const root = $getRoot();
            const text = root.getTextContent().trim();
            if (!text && attachments.length === 0) return;

            onSubmit(text);

            root.clear();
            const paragraph = $createParagraphNode();
            root.append(paragraph);
          });
        }

        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    // Handle paste - trim whitespace
    const removePasteCommand = editor.registerCommand<ClipboardEvent>(
      PASTE_COMMAND,
      (event) => {
        const pastedText = event.clipboardData?.getData("Text");

        if (pastedText) {
          const trimmedText = pastedText.trim();

          if (trimmedText !== pastedText) {
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.insertText(trimmedText);
              }
            });
            return true;
          }
        }

        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      removeCommand?.();
      removePasteCommand?.();
    };
  }, [editor, onSubmit, attachments.length]);

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const hasMessages = messages.length > 0;

  // Extract text from message parts
  const getMessageText = (
    parts: Array<{ type: string; text?: string }>
  ): string => {
    return parts
      .filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("");
  };

  return (
    <div className="flex h-full w-full flex-col items-center space-y-20 pb-16">
      {/* Hero Section - Show when no messages */}
      {!hasMessages && (
        <div className="relative flex items-center justify-center space-x-5">
          <Orb className="absolute -z-10 translate-y-1" />
          <h1 className="text-center text-2xl leading-tight font-semibold text-pretty whitespace-pre-wrap text-white select-none sm:text-3xl md:text-4xl lg:text-5xl">
            Say it. I'll make it real.
          </h1>
        </div>
      )}

      {/* Input Area */}
      <FileUpload onFilesAdded={handleAddedFiles}>
        <div className="flex w-full items-center justify-center">
          <div className="w-full max-w-2xl">
            <Chatbox
              onSubmitHandler={onSubmitHandler}
              handleAddedFiles={handleAddedFiles}
              disabled={isStreaming || !isReady}
              files={files}
              setFiles={setFiles}
            />
          </div>
        </div>
      </FileUpload>

      {/* Messages Area */}
      <div className="mt-10 flex w-full max-w-3xl flex-col items-center space-y-6 bg-black">
        {hasMessages ? (
          <div className="flex w-full flex-col space-y-4 px-4">
            {messages.map((message) => {
              const textContent = getMessageText(message.parts);

              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-800 text-white"
                    }`}
                  >
                    {textContent || (
                      <span className="animate-pulse text-neutral-400">
                        Thinking...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Streaming indicator */}
            {status === "submitted" && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-neutral-800 px-4 py-2">
                  <span className="animate-pulse text-neutral-400">
                    Thinking...
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Show latest response as fallback (for backwards compatibility)
          latestResponse && (
            <Textarea
              value={latestResponse}
              readOnly
              placeholder="Your response...."
              className="w-full border border-gray-100 bg-neutral-950 px-6 py-3 font-semibold text-white"
            />
          )
        )}

        {/* Error display */}
        {error && (
          <div className="w-full rounded-lg bg-red-900/50 px-4 py-2 text-red-200">
            Error: {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
