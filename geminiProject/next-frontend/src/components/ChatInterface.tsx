"use client";
import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Textarea } from "@/components/ui/TextArea";
import { Orb } from "@/components/ui/Orb";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { motion } from "motion/react";

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
import { AttachmentItem } from "./AttachmentItem";

interface ChatInterfaceProps {}

export default function ChatInterface({}: ChatInterfaceProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { addChatAttachment, attachments } = useAttachments();
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status, inputHeight]);

  useEffect(() => {
    if (!inputRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Use offsetHeight to include padding/borders if needed,
        // but contentRect is usually fine for ResizeObserver.
        // Let's use the element's offsetHeight for accuracy with padding.
        if (entry.target instanceof HTMLElement) {
          setInputHeight(entry.target.offsetHeight);
        }
      }
    });

    observer.observe(inputRef.current);

    return () => observer.disconnect();
  }, []);

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

  const hasMessages = messages.length > 0;

  // Extract text from message parts
  const getMessageText = (
    parts: Array<{ type: string; text?: string }>
  ): string => {
    return parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text"
      )
      .map((part) => part.text)
      .join("");
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="custom-scrollbar h-full w-full overflow-y-auto transition-[padding] duration-100 ease-out"
        style={{ paddingBottom: hasMessages ? `${inputHeight}px` : "0px" }}
      >
        {!hasMessages && (
          <div className="flex h-1/2 flex-col items-center justify-center pb-18">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative flex items-center justify-center space-x-5"
            >
              <Orb className="absolute -z-10 translate-y-1" />
              <h1 className="text-center text-2xl leading-tight font-semibold text-pretty whitespace-pre-wrap text-white select-none sm:text-3xl md:text-4xl lg:text-5xl">
                Say it. I'll make it real.
              </h1>
            </motion.div>
          </div>
        )}

        {hasMessages && (
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-6 px-4 pt-5">
            <div className="flex w-full flex-col space-y-10">
              {messages.map((message) => {
                const textContent = getMessageText(message.parts);
                const attachments = message.metadata?.attachments || [];
                const hasAttachments =
                  attachments.length > 0 && message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[80%] space-y-2">
                      {/* Attachments above message for user */}
                      {hasAttachments && (
                        <div className="flex space-x-2">
                          {attachments.map((att: any) => (
                            <AttachmentItem
                              key={att.id}
                              attachment={{
                                id: att.id,
                                type: att.type,
                                fileKey: att.fileKey,
                                url: att.imageUrl || att.documentUrl,
                                title: att.title,
                                variant: "chat",
                              }}
                            />
                          ))}
                        </div>
                      )}
                      {/* Message text bubble */}

                      <div
                        className={`rounded-2xl px-5 py-4 ${
                          message.role === "user"
                            ? "bg-black/70 text-white"
                            : "bg-zinc-800 text-white"
                        }`}
                      >
                        {textContent ? textContent : "Thinking..."}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Streaming indicator */}
              {status === "submitted" && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg bg-neutral-800 px-5 py-4">
                    <span className="animate-pulse text-neutral-400">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error display */}
            {error && (
              <div className="w-full rounded-lg bg-red-900/50 px-4 py-2 text-red-200">
                Error: {error.message}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Input Area */}
      <motion.div
        initial={
          !hasMessages
            ? { opacity: 0, bottom: "50%", y: "50%" }
            : { opacity: 0, bottom: 0, y: 0 }
        }
        animate={
          !hasMessages
            ? { opacity: 1, bottom: "50%", y: "50%" }
            : { opacity: 1, bottom: 0, y: 0 }
        }
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="pointer-events-none absolute right-0 left-0 z-50 flex w-full justify-center px-4"
      >
        <div
          ref={inputRef}
          className="pointer-events-auto w-full max-w-2xl pb-6"
        >
          <FileUpload onFilesAdded={handleAddedFiles}>
            <Chatbox
              onSubmitHandler={onSubmitHandler}
              handleAddedFiles={handleAddedFiles}
              disabled={isStreaming || !isReady}
              files={files}
              setFiles={setFiles}
            />
          </FileUpload>
        </div>
      </motion.div>
    </div>
  );
}
