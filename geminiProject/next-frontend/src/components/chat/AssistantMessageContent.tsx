"use client";

import type { UIMessage } from "ai";

import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";

type AssistantMessageContentProps = {
  message: UIMessage;
};

export function AssistantMessageContent({
  message,
}: AssistantMessageContentProps) {
  const textParts = message.parts.filter(
    (part): part is Extract<(typeof message.parts)[number], { type: "text" }> =>
      part.type === "text" && typeof part.text === "string" && part.text.trim().length > 0
  );

  if (textParts.length === 0) {
    return <div className="text-muted-foreground">Thinking...</div>;
  }

  return (
    <div className="space-y-3">
      {textParts.map((part, index) => (
        <MarkdownRenderer
          key={`${message.id}-text-${index}`}
          content={part.text}
        />
      ))}
    </div>
  );
}
