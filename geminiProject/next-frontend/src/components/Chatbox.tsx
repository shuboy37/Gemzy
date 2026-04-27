"use client";
import { useState, useContext, useCallback, useEffect } from "react";
import {
  Paperclip,
  Square,
  ArrowUp,
  Check,
  ChevronDown,
  Wrench,
  Globe,
  MessageSquare,
} from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { selectedModel } from "@/stores/ModelStore";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import PlaceholderPlugin from "@/lib/placeholder-plugin";
import { ConditionalTooltip } from "./ui/ConditionalTooltip";
import { ModelDropdown } from "./ModelDropdown";
import { useGetAllModels } from "@/hooks/useGetAllModels";
import { FileUploadContext, FileUploadTrigger } from "./ui/FileUpload";
import DuolingoButton from "./ui/DuolingoButton";
import { TextShimmer } from "./ui/TextShimmer";
import { motion, AnimatePresence } from "motion/react";
import { useAttachments } from "@/hooks/use-attachments";
import { AttachmentItem } from "./AttachmentItem";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { getModelConfigByModel } from "@/lib/models";
import { ChatTool, selectedToolAtom } from "@/stores/ToolStore";
import { useAuth } from "@/hooks/use-auth";
import {
  GUEST_DEFAULT_MODEL_ID,
  GUEST_DEFAULT_MODEL_NAME,
} from "@/lib/guest/guest-usage";
import { GUEST_COPY, formatGuestUsage } from "@/lib/guest/guest-copy";
import {
  guestRemainingAttemptsAtom,
  guestUsageSnapshotAtom,
} from "@/stores/GuestStore";

interface ChatboxProps {
  onSubmitHandler: () => void;
  handleAddedFiles: (files: File[]) => void;
  disabled: boolean;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export const Chatbox = ({
  onSubmitHandler,
  handleAddedFiles,
  disabled,
  setFiles,
}: ChatboxProps) => {
  const [editor] = useLexicalComposerContext();
  const [selectedModelState, setSelectedModelState] = useAtom(selectedModel);
  const model = selectedModelState.model;
  const [selectedTool, setSelectedTool] = useAtom(selectedToolAtom);
  const guestUsage = useAtomValue(guestUsageSnapshotAtom);
  const guestRemainingAttempts = useAtomValue(guestRemainingAttemptsAtom);
  const { isAuthenticated, isAuthLoading, isLoggingOut } = useAuth();
  const isGuestMode = !isAuthenticated && !isAuthLoading;
  const showAuthenticatedControls =
    isAuthenticated && !isAuthLoading && !isLoggingOut;
  const [isFocused, setIsFocused] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const { attachments, hasUploading, removeAttachment } = useAttachments();
  const [originalText] = useState("");
  const { isDragging } = useContext(FileUploadContext);

  const [isOpen, setIsOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const { data: allModelsData } = useGetAllModels();
  const selectedModelConfig = getModelConfigByModel(
    model,
    allModelsData?.allModelsConfigs
  );
  const isWebSearchEnabled = selectedTool === "web-search";
  const isGuestLimitReached = isGuestMode && guestRemainingAttempts <= 0;

  const toolOptions: Array<{
    value: ChatTool;
    label: string;
    description: string;
    icon: typeof MessageSquare;
  }> = [
    {
      value: "chat",
      label: "Chat",
      description: "Standard conversation with attachments enabled.",
      icon: MessageSquare,
    },
    {
      value: "web-search",
      label: "Web Search",
      description: "Fresh web-grounded answers with inline citations.",
      icon: Globe,
    },
  ];
  // Track editor content changes
  useEffect(() => {
    if (!editor) return;

    const removeListener = editor.registerTextContentListener((textContent) => {
      setHasContent(textContent.trim().length > 0);
    });

    return () => {
      removeListener();
    };
  }, [editor]);

  useEffect(() => {
    editor.setEditable(!(isAuthLoading || isLoggingOut));
  }, [editor, isAuthLoading, isLoggingOut]);

  useEffect(() => {
    if (!isGuestMode) return;

    if (
      selectedModelState.model !== GUEST_DEFAULT_MODEL_NAME ||
      selectedModelState.modelId !== GUEST_DEFAULT_MODEL_ID
    ) {
      setSelectedModelState({
        model: GUEST_DEFAULT_MODEL_NAME,
        modelId: GUEST_DEFAULT_MODEL_ID,
      });
    }
  }, [
    isGuestMode,
    selectedModelState.model,
    selectedModelState.modelId,
    setSelectedModelState,
  ]);

  useEffect(() => {
    if (isGuestMode && selectedTool !== "chat") {
      setSelectedTool("chat");
    }
  }, [isGuestMode, selectedTool, setSelectedTool]);

  useEffect(() => {
    if (showAuthenticatedControls) return;

    setIsOpen(false);
    setIsToolsOpen(false);
  }, [showAuthenticatedControls]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      const hasFiles = Array.from(items || []).some(
        (item) => item.kind === "file"
      );

      if ((isAuthLoading || isLoggingOut) && hasFiles) {
        e.preventDefault();
        return;
      }

      if (isGuestMode) {
        if (hasFiles) {
          e.preventDefault();
        }
        return;
      }

      if (isWebSearchEnabled) {
        if (hasFiles) {
          e.preventDefault();
        }
        return;
      }

      if (!items) return;

      const files: File[] = [];
      Array.from(items).forEach((item) => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      });

      if (files.length > 0) {
        e.preventDefault();
        handleAddedFiles(files);
        return;
      }
    },
    [handleAddedFiles, isAuthLoading, isGuestMode, isLoggingOut, isWebSearchEnabled]
  );
  return (
    <div className="w-full">
      <div className="w-full space-y-3">
        <div
          className={`relative w-full rounded-xl transition-all duration-300 ease-out ${
            isDragging &&
            "ring-ring ring-offset-background ring-2 ring-offset-2"
          }`}
        >
          {isDragging && (
            <div className="border-primary/40 bg-accent/95 text-accent-foreground absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed backdrop-blur-md">
              <div className="text-foreground flex items-center gap-2">
                <Paperclip className="size-5" />
                <p className="font-medium">Drop files to attach</p>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Supports images, documents, and more
              </p>
            </div>
          )}

          <div className="relative w-full">
            {originalText && (
              <div className="absolute inset-0 z-10 flex items-start px-4 py-3">
                <TextShimmer
                  className="flex min-h-[5rem] items-start text-base"
                  duration={0.7}
                >
                  {originalText}
                </TextShimmer>
              </div>
            )}
            <motion.div
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={`border-border bg-card/80 ring-border w-full resize-none rounded-2xl border font-medium shadow-xl ring-1 backdrop-blur-3xl transition-all duration-300 ${
                isDragging && "border-primary/40 shadow-lg"
              } ${
                hasContent && "shimmer-active border-primary/50 bg-card/90"
              } ${isFocused && "ring-ring/50"}`}
            >
              <div
                className={`flex items-center gap-2 ${attachments.length > 0 && "p-2"}`}
              >
                {attachments.map((attachment, i) => {
                  const onRemove = () => {
                    removeAttachment({ id: attachment.id });
                    setFiles((prev) =>
                      prev.filter((f) => f.name !== attachment.title)
                    );
                  };
                  return (
                    <motion.div
                      key={attachment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2, delay: i * 0.1 }}
                    >
                      <AttachmentItem
                        onRemove={onRemove}
                        key={attachment.id}
                        attachment={attachment}
                      />
                    </motion.div>
                  );
                })}
              </div>
              <PlainTextPlugin
                contentEditable={
                  <ContentEditable
                    autoFocus
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`placeholder:text-muted-foreground w-full px-4 py-3 ${
                      originalText && "text-transparent"
                    } text-foreground min-h-[120px] font-semibold shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                      isAuthLoading || isLoggingOut
                        ? "cursor-not-allowed opacity-70"
                        : ""
                    }`}
                    style={{ minHeight: "7.5rem" }}
                    onPaste={handlePaste}
                    aria-disabled={isAuthLoading || isLoggingOut}
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <PlaceholderPlugin placeholder="What's on your mind?" />
              <HistoryPlugin />
              <div className="flex w-full items-center justify-between px-3 pb-3">
                <div className="flex w-full gap-3.5">
                  <ConditionalTooltip
                    content={
                      isAuthLoading
                        ? "Checking your session"
                        : isLoggingOut
                          ? "Signing you out"
                        : isGuestMode
                          ? "Attachments are unavailable for guests"
                          : isWebSearchEnabled
                            ? "Attachments are unavailable when Web Search is on"
                            : "Attach a file"
                    }
                    side="top"
                    showTooltip={true}
                    className="p-2 text-xs"
                  >
                    <FileUploadTrigger asChild>
                      <DuolingoButton
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="bg-secondary text-secondary-foreground"
                        disabled={
                          isAuthLoading ||
                          isLoggingOut ||
                          isGuestMode ||
                          isWebSearchEnabled ||
                          !selectedModelConfig?.isFileSupported ||
                          hasUploading
                        }
                      >
                        <Paperclip className="text-secondary-foreground size-5" />
                      </DuolingoButton>
                    </FileUploadTrigger>
                  </ConditionalTooltip>
                  {showAuthenticatedControls ? (
                    <>
                      <DropdownMenu
                        open={isToolsOpen}
                        onOpenChange={setIsToolsOpen}
                      >
                        <ConditionalTooltip
                          content="Choose Tool"
                          showTooltip={true}
                          side="top"
                          className="p-2 text-xs"
                        >
                          <DropdownMenuTrigger asChild>
                            <DuolingoButton
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="bg-secondary text-secondary-foreground flex w-fit items-center justify-center rounded-2xl outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            >
                              <div className="flex origin-center cursor-pointer items-center justify-between gap-2 p-4">
                                <Wrench className="text-secondary-foreground size-4" />
                                <span className="mobile-text text-secondary-foreground min-w-0 truncate text-xs font-medium sm:text-sm">
                                  {isWebSearchEnabled ? "Web Search" : "Tools"}
                                </span>
                                <motion.div
                                  animate={{ rotate: isToolsOpen ? 180 : 0 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                    mass: 1,
                                    ease: "easeInOut",
                                    duration: 0.2,
                                  }}
                                >
                                  <ChevronDown className="text-secondary-foreground size-5" />
                                </motion.div>
                              </div>
                            </DuolingoButton>
                          </DropdownMenuTrigger>
                        </ConditionalTooltip>
                        <AnimatePresence>
                          {isToolsOpen && (
                            <DropdownMenuContent
                              sideOffset={8}
                              align="start"
                              side="top"
                              avoidCollisions={true}
                              collisionPadding={16}
                              className="border-border bg-popover text-popover-foreground w-72 overflow-visible border p-2"
                            >
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="space-y-1"
                              >
                                {toolOptions.map((option) => {
                                  const Icon = option.icon;
                                  const isSelected =
                                    selectedTool === option.value;
                                  return (
                                    <DropdownMenuItem
                                      key={option.value}
                                      onSelect={() =>
                                        setSelectedTool(option.value)
                                      }
                                      className={`focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-xl border px-3 py-3 ${
                                        isSelected
                                          ? "border-primary/60 bg-primary/10 text-foreground"
                                          : "border-border bg-card text-card-foreground"
                                      }`}
                                    >
                                      <div className="flex w-full items-start gap-3">
                                        <Icon className="mt-0.5 size-4 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold">
                                              {option.label}
                                            </span>
                                            {isSelected && (
                                              <Check className="text-primary size-4 shrink-0" />
                                            )}
                                          </div>
                                          <p className="text-muted-foreground mt-1 text-xs">
                                            {option.description}
                                          </p>
                                        </div>
                                      </div>
                                    </DropdownMenuItem>
                                  );
                                })}
                              </motion.div>
                            </DropdownMenuContent>
                          )}
                        </AnimatePresence>
                      </DropdownMenu>
                      <DropdownMenu
                        open={isOpen}
                        onOpenChange={setIsOpen}
                        modal={false}
                      >
                        <ConditionalTooltip
                          content="Choose Model"
                          showTooltip={true}
                          side="top"
                          className="p-2 text-xs"
                        >
                          <DropdownMenuTrigger asChild>
                            <DuolingoButton
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="bg-secondary text-secondary-foreground flex w-fit items-center justify-center rounded-2xl outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            >
                              <div className="flex origin-center cursor-pointer items-center justify-between p-4">
                                <span className="mobile-text text-secondary-foreground min-w-0 truncate text-xs font-medium sm:text-sm">
                                  {selectedModelConfig.displayName}
                                </span>
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
                                    className="text-secondary-foreground size-8 rounded-md p-1"
                                    strokeOpacity="1"
                                  />
                                </motion.div>
                              </div>
                            </DuolingoButton>
                          </DropdownMenuTrigger>
                        </ConditionalTooltip>
                        <AnimatePresence>
                          {isOpen && (
                            <DropdownMenuContent
                              sideOffset={8}
                              align="start"
                              side="top"
                              avoidCollisions={true}
                              collisionPadding={16}
                              className="z-[120] overflow-visible border-none bg-transparent p-0 shadow-none"
                            >
                              <motion.div
                                initial={{
                                  opacity: 0,
                                  scale: 0.95,
                                  y: 10,
                                }}
                                animate={{
                                  opacity: 1,
                                  scale: 1,
                                  y: 0,
                                }}
                                exit={{
                                  opacity: 0,
                                  scale: 0.95,
                                  y: 10,
                                }}
                                transition={{
                                  duration: 0.15,
                                  ease: "easeOut",
                                }}
                              >
                                <ModelDropdown isPlanMode={false} />
                              </motion.div>
                            </DropdownMenuContent>
                          )}
                        </AnimatePresence>
                      </DropdownMenu>
                    </>
                  ) : (
                    <div className="bg-secondary text-secondary-foreground flex items-center rounded-xl px-4 py-2 text-xs font-medium sm:text-sm">
                      {isAuthLoading
                        ? "Checking session..."
                        : isLoggingOut
                          ? "Signing out..."
                        : GUEST_DEFAULT_MODEL_NAME}
                    </div>
                  )}
                </div>

                {disabled ? (
                  <DuolingoButton
                    onClick={() => {}}
                    variant="icon"
                    size="icon"
                    aria-label="Stop message"
                  >
                    <Square className="fill-primary-foreground size-3" />
                  </DuolingoButton>
                ) : (
                  <DuolingoButton
                    disabled={hasUploading || disabled}
                    onClick={onSubmitHandler}
                    variant="icon"
                    size="icon"
                    aria-label="Send message"
                  >
                    <ArrowUp className="size-5" />
                  </DuolingoButton>
                )}
              </div>
              {isGuestMode && (
                <div className="text-muted-foreground px-4 pb-3 text-xs">
                  {isGuestLimitReached
                    ? GUEST_COPY.limitReached
                    : `${GUEST_COPY.guestModelLine} • ${formatGuestUsage(
                        guestUsage.usedCount,
                        guestUsage.maxCount
                      )}`}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
