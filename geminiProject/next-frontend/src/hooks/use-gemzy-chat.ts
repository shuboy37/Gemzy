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
import { ChatAttachment, ChatRequest } from "@/lib/api-types";
import toast from "react-hot-toast";
import { ApiAttachment, AttachmentType } from "@/lib/schemas/attachment.schema";

function areAttachmentsReady(
  attachments: (Attachment | LocalAttachment)[]
): boolean {
  return attachments.every((att) => {
    if ("uploadProgress" in att && !att.isUploadDone) {
      return false;
    }
    if ("fileKey" in att) {
      if (["image", "pdf", "txt"].includes(att.type)) {
        return "url" in att && !!att.url;
      }
      return true;
    }
    return false;
  });
}

function prepareAttachmentsForAPI(
  attachments: (Attachment | LocalAttachment)[]
): ApiAttachment[] {
  return attachments
    .filter((att): att is Attachment => "fileKey" in att && !!att.fileKey)
    .map((att): ApiAttachment => {
      const { variant, ...apiAttachment } = att;
      return apiAttachment;
    });
}

export function useGemzyChat() {
  const modelId = useAtomValue(selectedModel).modelId;

  const { attachments, hasUploading, removeAttachment } = useAttachments();

  const attachmentsRef = useRef<ChatAttachment[]>([]);
  const modelIdRef = useRef(modelId);
  const messageAttachmentsRef = useRef<Map<string, ChatAttachment[]>>(
    new Map()
  );

  useEffect(() => {
    modelIdRef.current = modelId;
  }, [modelId]);

  const preparedAttachments = useMemo(
    () => prepareAttachmentsForAPI(attachments),
    [attachments]
  );

  useEffect(() => {
    attachmentsRef.current = preparedAttachments;
  }, [preparedAttachments]);

  const isReady = !hasUploading && areAttachmentsReady(attachments);

  const chat = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: ():ChatRequest => ({
        model: modelIdRef.current,
        attachments:
          attachmentsRef.current.length > 0
            ? attachmentsRef.current
            : undefined,
      }),
    }),
    onFinish: ({ message }) => {
      console.log("[useGemzyChat] Message complete:", message.id);
    },
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

      const messageKey = `pending_${text.trim()}`;
      if (preparedAttachments.length > 0) {
        messageAttachmentsRef.current.set(messageKey, [...preparedAttachments]);
      }

      chat.sendMessage({ text });

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

  const messagesWithAttachments: MyUIMessage[] = useMemo(() => {
    return chat.messages.map((msg) => {
      if (msg.role === "user") {
        const textContent = msg.parts
          .filter(
            (part): part is { type: "text"; text: string } =>
              part.type === "text"
          )
          .map((part) => part.text)
          .join("");

        let stored = messageAttachmentsRef.current.get(msg.id);
        if (!stored) {
          const pendingKey = `pending_${textContent.trim()}`;
          stored = messageAttachmentsRef.current.get(pendingKey);
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
    messages: messagesWithAttachments,
    sendMessage: chat.sendMessage,
    status: chat.status,
    error: chat.error,
    stop: chat.stop,
    setMessages: chat.setMessages,

    sendWithAttachments,
    latestResponse,
    isStreaming,
    isReady,
    modelId,
  };
}

export type UseGemzyChatReturn = ReturnType<typeof useGemzyChat>;
