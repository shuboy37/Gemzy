"use client";
import { useState, useContext, useCallback, useEffect } from "react";
import { Paperclip, Square, ArrowUp } from "lucide-react";
import { ModelDropdown } from "@/components/ui/ReusableUI";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import PlaceholderPlugin from "@/lib/placeholder-plugin";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  KEY_ENTER_COMMAND,
  PASTE_COMMAND,
} from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { lexicalConfig } from "@/lib/lexical-config";
import { ConditionalTooltip } from "./ui/ConditionalTooltip";
import {
  FileUpload,
  FileUploadContext,
  FileUploadTrigger,
} from "./ui/FileUpload";
import DuolingoButton from "./ui/DuolingoButton";
import { TextShimmer } from "./ui/TextShimmer";
import { motion } from "motion/react";
import { useAttachments } from "@/hooks/use-attachments";
import { AttachmentItem } from "./AttachmentItem";

interface ChatboxProps {
  onSubmitHandler: () => void;
  handleAddedFiles: (files: File[]) => void;
  disabled: boolean;
  model: string;
  setModel: (model: string) => void;
  files: File[];
  // setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export const Chatbox = ({
  onSubmitHandler,
  handleAddedFiles,
  disabled,
  model,
  setModel,
  files,
  // setFiles,
}: ChatboxProps) => {
  const [editor] = useLexicalComposerContext();
  const [isFocused, setIsFocused] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const { attachments, hasUploading, removeAttachment } = useAttachments();
  const [originalText, setOriginalText] = useState("");
  const { isDragging } = useContext(FileUploadContext);

  const [isOpen, setIsOpen] = useState(false);

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
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
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
    [handleAddedFiles, editor]
  );
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-2">
        {attachments.map((attachment, i) => {
          const onRemove = () => removeAttachment({ id: attachment.id });
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
      <div className="w-full space-y-3">
        <div
          className={`relative w-full rounded-xl transition-all duration-300 ease-out ${
            isDragging &&
            "ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-100"
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 bg-gradient-to-br from-rose-50 to-rose-300 backdrop-blur-md">
              <div className="flex items-center gap-2 text-indigo-700">
                <Paperclip className="size-5" />
                <p className="font-medium">Drop files to attach</p>
              </div>
              <p className="mt-1 text-sm text-indigo-500">
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
              className={`w-full resize-none rounded-xl bg-neutral-900 font-medium shadow-[0_1px_0_#4b5563] transition-all duration-300 ${
                isDragging &&
                "border-indigo-200 shadow-[0_4px_12px_rgba(99,102,241,0.15)]"
              } ${
                hasContent && "shimmer-active border-transparent bg-black"
              } ${isFocused && "ring-1 ring-indigo-600 ring-offset-2"}`}
            >
              <PlainTextPlugin
                contentEditable={
                  <ContentEditable
                    autoFocus
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full px-4 py-3 placeholder:text-gray-400 ${
                      originalText && "text-transparent"
                    } min-h-[120px] font-semibold text-white shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0`}
                    style={{ minHeight: "7.5rem" }}
                    onPaste={handlePaste}
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <PlaceholderPlugin placeholder="What's on your mind?" />
              <HistoryPlugin />
              <div className="flex w-full items-center justify-between px-3 pb-3">
                <div className="flex w-full gap-3.5">
                  <ConditionalTooltip
                    content="Attach a file"
                    side="top"
                    showTooltip={true}
                  >
                    <FileUploadTrigger asChild>
                      <DuolingoButton
                        type="button"
                        variant="secondary"
                        size="icon"
                      >
                        <Paperclip className="size-5 text-stone-600" />
                      </DuolingoButton>
                    </FileUploadTrigger>
                  </ConditionalTooltip>
                  <ConditionalTooltip
                    content="Choose Model"
                    showTooltip={true}
                    side="top"
                  >
                    <DuolingoButton
                      type="button"
                      variant="secondary"
                      size="icon"
                    >
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
                    </DuolingoButton>
                  </ConditionalTooltip>
                </div>
                {disabled ? (
                  <DuolingoButton
                    onClick={() => {}}
                    variant="icon"
                    size="icon"
                    aria-label="Stop message"
                  >
                    <Square className="size-3 fill-white" />
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
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
