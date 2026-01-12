"use client";

import { useChat, UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

type MetaData = {
  attachments?: any[];
  userMessage?: string;
};

type MyUIMessage = UIMessage<MetaData>;
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
          documentUrl: att.attachmentUrl,
          title: att.title,
        } satisfies ChatAttachment;
      }

      if (att.type === "docx") {
        return {
          id: att.id,
          type: "docx" as const,
          fileKey: att.fileKey,
          documentUrl: att.attachmentUrl,
          title: att.title,
        } satisfies ChatAttachment;
      }

      if (att.type === "txt") {
        return {
          id: att.id,
          type: "txt" as const,
          fileKey: att.fileKey,
          documentUrl: att.attachmentUrl,
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

export function useGemzyChat() {
  const modelId = useAtomValue(selectedModel).modelId;

  const { attachments, hasUploading, removeAttachment } = useAttachments();

  const attachmentsRef = useRef<ChatAttachment[]>([]);
  const modelIdRef = useRef(modelId);
  // Store attachments by message ID for client-side injection
  const messageAttachmentsRef = useRef<Map<string, ChatAttachment[]>>(
    new Map()
  );

  // Keep modelId ref in sync with current value
  useEffect(() => {
    modelIdRef.current = modelId;
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

  const chat = useChat<MyUIMessage>({
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

      // Store attachments for this message (use text as temporary key)
      const messageKey = `pending_${text.trim()}`;
      if (preparedAttachments.length > 0) {
        messageAttachmentsRef.current.set(messageKey, [...preparedAttachments]);
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

  const latestResponse = useMemo(() => {
    const assistantMessages = chat.messages.filter(
      (m) => m.role === "assistant"
    );
    if (assistantMessages.length === 0) return "";

    const lastMessage = assistantMessages[assistantMessages.length - 1];

    return lastMessage.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text"
      )
      .map((part) => part.text)
      .join("");
  }, [chat.messages]);

  const isStreaming =
    chat.status === "streaming" || chat.status === "submitted";

  // Inject attachments into user messages
  const messagesWithAttachments: MyUIMessage[] = useMemo(() => {
    return chat.messages.map((msg) => {
      if (msg.role === "user") {
        // Extract text from message
        const textContent = msg.parts
          .filter(
            (part): part is { type: "text"; text: string } =>
              part.type === "text"
          )
          .map((part) => part.text)
          .join("");

        // Try to find stored attachments (first by message ID, then by text)
        let stored = messageAttachmentsRef.current.get(msg.id);
        if (!stored) {
          const pendingKey = `pending_${textContent.trim()}`;
          stored = messageAttachmentsRef.current.get(pendingKey);
          // Move from pending to actual message ID
          if (stored) {
            messageAttachmentsRef.current.set(msg.id, stored);
            messageAttachmentsRef.current.delete(pendingKey);
          }
        }

        if (stored && stored.length > 0) {
          return {
            ...msg,
            metadata: {
              attachments: stored,
              userMessage: textContent,
            },
          };
        }
      }
      return msg;
    });
  }, [chat.messages]);

  return {
    // Original useChat returns
    messages: messagesWithAttachments,
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
