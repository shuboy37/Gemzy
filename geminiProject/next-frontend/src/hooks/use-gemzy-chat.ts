"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useAtomValue } from "jotai";
import { selectedModel } from "@/stores/ModelStore";
import { useCallback, useMemo, useRef, useEffect } from "react";
import {
  Attachment,
  LocalAttachment,
  useAttachments,
} from "@/hooks/use-attachments";
import { ChatAttachment } from "@/lib/api-types";
import toast from "react-hot-toast";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if all attachments have their URLs ready
 */
function areAttachmentsReady(
  attachments: (Attachment | LocalAttachment)[]
): boolean {
  return attachments.every((att) => {
    // LocalAttachments (still uploading) are not ready
    if ("uploadProgress" in att && !att.isUploadDone) {
      return false;
    }
    // Images need imageUrl
    if (att.type === "image" && "fileKey" in att) {
      return "attachmentUrl" in att && !!att.attachmentUrl;
    }
    // Documents just need fileKey
    if ("fileKey" in att) {
      return !!att.fileKey;
    }
    return false;
  });
}

/**
 * Convert attachments to API format
 */
function prepareAttachmentsForAPI(
  attachments: (Attachment | LocalAttachment)[]
) {
  return attachments
    .filter((att): att is Attachment => "fileKey" in att && !!att.fileKey)
    .map((att): ChatAttachment => {
      if (att.type === "image") {
        return {
          id: att.id,
          type: "image" as const,
          fileKey: att.fileKey,
          imageUrl: att.attachmentUrl || "",
          title: att.title,
        } satisfies ChatAttachment;
      }

      if (att.type === "pdf") {
        return {
          id: att.id,
          type: "pdf" as const,
          fileKey: att.fileKey,
          documentUrl: att.attachmentUrl, // Pass presigned URL from frontend
          title: att.title,
        } satisfies ChatAttachment;
      }

      if (att.type === "docx") {
        return {
          id: att.id,
          type: "docx" as const,
          fileKey: att.fileKey,
          documentUrl: att.attachmentUrl, // Pass presigned URL from frontend
          title: att.title,
        } satisfies ChatAttachment;
      }

      if (att.type === "txt") {
        return {
          id: att.id,
          type: "txt" as const,
          fileKey: att.fileKey,
          documentUrl: att.attachmentUrl, // Pass presigned URL from frontend
          title: att.title,
        } satisfies ChatAttachment;
      }

      // video or unknown
      return {
        id: att.id,
        type: "video" as const,
        fileKey: att.fileKey,
        title: att.title,
      } satisfies ChatAttachment;
    });
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Custom hook that wraps AI SDK's useChat with Gemzy-specific configuration.
 *
 * Features:
 * - Automatically includes the selected model in every request
 * - Handles S3 attachments (images and documents)
 * - Provides type-safe message handling
 * - Waits for uploads to complete before sending
 *
 * @example
 * ```tsx
 * const { messages, sendWithAttachments, status, isReady } = useGemzyChat();
 *
 * // Send text only
 * sendWithAttachments("Hello!");
 *
 * // Attachments are automatically included from useAttachments context
 * ```
 */
export function useGemzyChat() {
  const modelId = useAtomValue(selectedModel).modelId;

  const { attachments, hasUploading, removeAttachment } = useAttachments();

  const attachmentsRef = useRef<ChatAttachment[]>([]);
  const modelIdRef = useRef(modelId);

  // Keep modelId ref in sync with current value
  useEffect(() => {
    modelIdRef.current = modelId;
    console.log("[useGemzyChat] Model changed to:", modelId);
  }, [modelId]);

  // Keep refs in sync with current values
  const preparedAttachments = useMemo(
    () => prepareAttachmentsForAPI(attachments),
    [attachments]
  );

  // Keep attachments ref in sync
  useEffect(() => {
    attachmentsRef.current = preparedAttachments;
  }, [preparedAttachments]);

  // Check if ready to send
  const isReady = !hasUploading && areAttachmentsReady(attachments);

  const chat = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({
        model: modelIdRef.current,
        attachments:
          attachmentsRef.current.length > 0
            ? attachmentsRef.current
            : undefined,
      }),
    }),
    // Called when streaming completes
    onFinish: ({ message }) => {
      console.log("[useGemzyChat] Message complete:", message.id);
    },
    // Called on error
    onError: (error) => {
      console.error("[useGemzyChat] Error:", error);
      toast.error(error.message || "Failed to send message");
    },
  });

  /**
   * Send a message with attachments
   * Attachments are automatically included from the context
   */
  const sendWithAttachments = useCallback(
    (text: string) => {
      if (!text.trim() && attachments.length === 0) {
        toast.error("Please enter a message or add attachments");
        return;
      }

      if (hasUploading) {
        toast.error("Please wait for uploads to complete");
        return;
      }

      if (!areAttachmentsReady(attachments)) {
        toast.error("Please wait for attachments to be ready");
        return;
      }

      // Send the message
      chat.sendMessage({ text });

      // Clear attachments after sending
      attachments.forEach((att) => {
        removeAttachment({ id: att.id });
      });
    },
    [chat, attachments, hasUploading, removeAttachment]
  );

  /**
   * Get the latest assistant message text (for compatibility)
   */
  const latestResponse = useMemo(() => {
    const assistantMessages = chat.messages.filter(
      (m) => m.role === "assistant"
    );
    if (assistantMessages.length === 0) return "";

    const lastMessage = assistantMessages[assistantMessages.length - 1];

    // Extract text from message parts
    return lastMessage.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text"
      )
      .map((part) => part.text)
      .join("");
  }, [chat.messages]);

  /**
   * Check if currently streaming
   */
  const isStreaming =
    chat.status === "streaming" || chat.status === "submitted";

  return {
    // Original useChat returns
    messages: chat.messages,
    sendMessage: chat.sendMessage,
    status: chat.status,
    error: chat.error,
    stop: chat.stop,
    setMessages: chat.setMessages,

    // Gemzy-specific helpers
    sendWithAttachments,
    latestResponse,
    isStreaming,
    isReady,
    modelId,
  };
}

export type UseGemzyChatReturn = ReturnType<typeof useGemzyChat>;
