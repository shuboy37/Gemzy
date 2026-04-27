"use client";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type MouseEvent,
} from "react";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { Orb } from "@/components/ui/Orb";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { motion } from "motion/react";
import { MessageSquareShare } from "lucide-react";

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
import { type Attachment, useAttachments } from "@/hooks/use-attachments";
import { Chatbox } from "./Chatbox";
import { useGemzyChat } from "@/hooks/use-gemzy-chat";
import { AttachmentItem } from "./AttachmentItem";
import { AssistantMessageContent } from "@/components/chat/AssistantMessageContent";
import { selectedToolAtom } from "@/stores/ToolStore";
import { ChatAttachment } from "@/lib/api-types";
import { ThemeToggle } from "./ui/ThemeToggle";
import { ConditionalTooltip } from "./ui/ConditionalTooltip";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";
import { useChatSessionReset } from "@/hooks/use-chat-session-reset";

function ImageGenerationLoadingCard() {
  const blocks = Array.from({ length: 144 }, (_, i) => i);

  return (
    <div className="border-border bg-card text-card-foreground w-full max-w-md overflow-hidden rounded-2xl border p-3">
      <div className="text-muted-foreground mb-3 text-sm">
        Generating your image...
      </div>
      <div className="bg-muted grid aspect-square grid-cols-12 gap-1 overflow-hidden rounded-xl p-2">
        {blocks.map((block) => (
          <div
            key={block}
            className="bg-primary/10 animate-pulse rounded-[4px]"
            style={{
              animationDelay: `${(block % 12) * 80}ms`,
              animationDuration: `${1.2 + (block % 5) * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function toRenderableAttachment(attachment: ChatAttachment): Attachment {
  const base = {
    id: attachment.id,
    fileKey: attachment.fileKey,
    title: attachment.title,
    variant: "chat" as const,
  };

  if (attachment.type === "video") {
    return {
      ...base,
      type: "video",
    };
  }

  if (attachment.type === "docx") {
    return attachment.url
      ? {
          ...base,
          type: "docx",
          url: attachment.url,
        }
      : {
          ...base,
          type: "docx",
        };
  }

  return {
    ...base,
    type: attachment.type,
    url: attachment.url,
  };
}

export default function ChatInterface() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const { addChatAttachment, attachments, clearAttachments } = useAttachments();
  const [editor] = useLexicalComposerContext();
  const selectedTool = useAtomValue(selectedToolAtom);
  const { user, isAuthenticated, isAuthLoading, isLoggingOut } = useAuth();
  const { resetVersion } = useChatSessionReset();
  const isGuestMode = !isAuthenticated && !isAuthLoading;

  const heroEffectRef = useRef<HTMLDivElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const isHeroHoverRef = useRef(false);
  const lastResetVersionRef = useRef(resetVersion);
  const revealRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const maskYRef = useRef(0);
  const maskInitializedRef = useRef(false);

  // Use the new AI SDK powered hook
  const { messages, sendWithAttachments, isStreaming, isReady, status, error } =
    useGemzyChat();

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

  useEffect(() => {
    if (resetVersion === lastResetVersionRef.current) {
      return;
    }

    lastResetVersionRef.current = resetVersion;
    setFiles([]);
    clearAttachments();
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      root.append($createParagraphNode());
    });
  }, [clearAttachments, editor, resetVersion]);

  const onSubmit = useCallback(
    async (text: string) => {
      if (!text.trim() && attachments.length === 0) return;

      const result = await sendWithAttachments(text);

      if (result === "guest-limit-reached") {
        router.push("/signup");
        return;
      }

      if (result === "auth-loading") {
        return;
      }

      if (result === "logging-out") {
        return;
      }

      // Clear files state after sending
      setFiles([]);
    },
    [attachments.length, router, sendWithAttachments]
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
      if (isLoggingOut) {
        toast.error("Signing you out. Please wait a moment.");
        return;
      }

      if (isAuthLoading) {
        toast.error("Checking your session. Please try again in a moment.");
        return;
      }

      if (isGuestMode) {
        toast.error("Attachments are unavailable for guests.");
        return;
      }

      if (selectedTool === "web-search") {
        toast.error("Attachments are unavailable when Web Search is on.");
        return;
      }

      setFiles((prev) => [...prev, ...newFiles]);
      newFiles.forEach(addChatAttachment);
    },
    [addChatAttachment, isAuthLoading, isGuestMode, isLoggingOut, selectedTool]
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
        if (selectedTool === "web-search") {
          return false;
        }

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
  }, [editor, onSubmit, attachments.length, selectedTool]);

  const hasMessages = messages.length > 0;
  const hasPendingImageMessage = messages.some(
    (message) => message.metadata?.isGeneratingImage
  );

  useEffect(() => {
    const section = heroEffectRef.current;
    const overlay = heroOverlayRef.current;

    if (!section || !overlay) return;

    if (hasMessages) {
      isHeroHoverRef.current = false;
      revealRef.current = 0;
      overlay.style.opacity = "0";
      overlay.style.webkitMaskImage = "none";
      overlay.style.maskImage = "none";
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.height > 0 && !isHeroHoverRef.current) {
        maskYRef.current = rect.height / 2;
        maskInitializedRef.current = true;
      }
    });

    observer.observe(section);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      rafIdRef.current = requestAnimationFrame(tick);
      revealRef.current = lerp(
        revealRef.current,
        isHeroHoverRef.current ? 1 : 0,
        0.055
      );

      const activeOverlay = heroOverlayRef.current;
      const activeSection = heroEffectRef.current;
      if (!activeOverlay || !activeSection) return;

      const width = activeSection.getBoundingClientRect().width;
      const x = Math.max(0, Math.min(mouseRef.current.x, width));

      activeOverlay.style.opacity = String(revealRef.current);
      activeOverlay.style.webkitMaskImage = `radial-gradient(ellipse 65% 60% at ${x}px ${maskYRef.current}px, black 0%, black 40%, transparent 100%)`;
      activeOverlay.style.maskImage = `radial-gradient(ellipse 65% 60% at ${x}px ${maskYRef.current}px, black 0%, black 40%, transparent 100%)`;
    };

    tick();

    return () => {
      observer.disconnect();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [hasMessages]);

  const handleHeroMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (hasMessages) return;

      const section = heroEffectRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerY = rect.height / 2;

      if (!maskInitializedRef.current) {
        maskYRef.current = centerY;
        maskInitializedRef.current = true;
      }

      if (y >= centerY * 0.55) {
        maskYRef.current = y;
      }

      mouseRef.current = { x, y };
    },
    [hasMessages]
  );

  const handleHeroMouseEnter = useCallback(() => {
    if (hasMessages) return;
    isHeroHoverRef.current = true;
  }, [hasMessages]);

  const handleHeroMouseLeave = useCallback(() => {
    if (hasMessages) return;
    isHeroHoverRef.current = false;
  }, [hasMessages]);

  const heroTitle = isAuthLoading
    ? "Loading your workspace..."
    : user?.name
      ? `Welcome back, ${user.name}`
      : "Say it. I'll make it real.";

  return (
    <div
      ref={heroEffectRef}
      className="relative h-full w-full overflow-hidden"
      onMouseMove={handleHeroMouseMove}
      onMouseEnter={handleHeroMouseEnter}
      onMouseLeave={handleHeroMouseLeave}
    >
      {!hasMessages && (
        <div className="pointer-events-none absolute inset-0 z-0 transition-all duration-300 ease-out">
          <div
            className="absolute inset-0 bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/hero-dither.png')",
              backgroundSize: "cover",
              opacity: 0.9,
            }}
          />
          <div
            ref={heroOverlayRef}
            className="absolute inset-0 bg-center bg-no-repeat opacity-0"
            style={{
              backgroundImage: "url('/hero.png')",
              backgroundSize: "cover",
            }}
          />
          <div className="from-background/5 to-background/30 absolute inset-0 bg-gradient-to-b via-transparent" />
        </div>
      )}

      <div className="absolute top-4 right-6 z-40 flex items-center gap-2">
        <ThemeToggle />

        <ConditionalTooltip
          content="Share Chat"
          side="bottom"
          showTooltip={true}
        >
          <button className="border-border bg-card/60 hover:bg-accent flex items-center justify-center rounded-lg border p-3 transition-all duration-200 ease-in-out active:scale-95 active:duration-75">
            <MessageSquareShare className="text-foreground size-4" />
          </button>
        </ConditionalTooltip>
      </div>

      <div
        className="custom-scrollbar relative z-10 h-full w-full overflow-y-auto transition-[padding] duration-100 ease-out"
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
              <h1 className="text-center text-2xl leading-tight font-semibold text-pretty whitespace-pre-wrap text-[#ffe3c6] select-none [text-shadow:0_1px_2px_rgba(255,255,255,0.72),0_8px_20px_rgba(0,0,0,0.35)] sm:text-3xl md:text-4xl lg:text-5xl dark:[text-shadow:0_2px_10px_rgba(0,0,0,0.75)]">
                {heroTitle}
              </h1>
            </motion.div>
          </div>
        )}

        {hasMessages && (
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-6 px-4 pt-5">
            <div className="flex w-full flex-col space-y-10">
              {messages.map((message) => {
                const textContent = message.parts
                  .filter(
                    (
                      part
                    ): part is Extract<
                      (typeof message.parts)[number],
                      { type: "text" }
                    > => part.type === "text" && typeof part.text === "string"
                  )
                  .map((part) => part.text)
                  .join("");
                const attachments = message.metadata?.attachments || [];
                const hasAttachments =
                  attachments.length > 0 && message.role === "user";
                const generatedImageUrl = message.metadata?.generatedImageUrl;
                const isGeneratingImage = message.metadata?.isGeneratingImage;

                return (
                  <div
                    key={message.id}
                    className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[80%] space-y-2">
                      {/* Attachments above message for user */}
                      {hasAttachments && (
                        <div className="flex space-x-2">
                          {attachments.map((att: ChatAttachment) => (
                            <AttachmentItem
                              key={att.id}
                              attachment={toRenderableAttachment(att)}
                            />
                          ))}
                        </div>
                      )}
                      {/* Message text bubble */}
                      {(textContent || !generatedImageUrl) &&
                        !isGeneratingImage && (
                          <div
                            className={`rounded-2xl px-5 py-4 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "border-border bg-card text-card-foreground border"
                            }`}
                          >
                            {message.role === "assistant" ? (
                              <AssistantMessageContent message={message} />
                            ) : textContent ? (
                              textContent
                            ) : (
                              "Thinking..."
                            )}
                          </div>
                        )}

                      {isGeneratingImage && message.role === "assistant" && (
                        <ImageGenerationLoadingCard />
                      )}

                      {generatedImageUrl && message.role === "assistant" && (
                        <div className="border-border bg-card overflow-hidden rounded-2xl border p-2">
                          <img
                            src={generatedImageUrl}
                            alt={
                              message.metadata?.imagePrompt || "Generated image"
                            }
                            className="max-h-[28rem] w-full rounded-xl object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Streaming indicator */}
              {status === "submitted" && !hasPendingImageMessage && (
                <div className="flex justify-start">
                  <div className="border-border bg-card max-w-[80%] rounded-lg border px-5 py-4">
                    <span className="text-muted-foreground animate-pulse">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error display */}
            {error && (
              <div className="bg-destructive text-destructive-foreground w-full rounded-lg px-4 py-2">
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
          <FileUpload
            onFilesAdded={handleAddedFiles}
            disabled={
              isLoggingOut ||
              selectedTool === "web-search" ||
              isGuestMode ||
              isAuthLoading
            }
          >
            <Chatbox
              onSubmitHandler={onSubmitHandler}
              handleAddedFiles={handleAddedFiles}
              disabled={
                isLoggingOut || isAuthLoading || isStreaming || !isReady
              }
              files={files}
              setFiles={setFiles}
            />
          </FileUpload>
        </div>
      </motion.div>
    </div>
  );
}
