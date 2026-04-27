"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "@/components/chat/CodeBlock";

type MarkdownRendererProps = {
  content: string;
};

type CodeRendererProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

function extractLanguage(className?: string) {
  const match = /language-([\w-]+)/.exec(className || "");
  return match?.[1] ?? "text";
}

function CodeRenderer({ className, children, ...props }: CodeRendererProps) {
  const code = String(children).replace(/\n$/, "");
  const language = extractLanguage(className);
  const isBlock = className?.includes("language-") || code.includes("\n");

  if (isBlock) {
    return <CodeBlock language={language} code={code} />;
  }

  return (
    <code
      className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
      {...props}
    >
      {children}
    </code>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="gemzy-markdown prose max-w-none text-[15px] leading-7 text-card-foreground prose-p:my-3 prose-headings:text-card-foreground prose-strong:text-card-foreground prose-a:text-primary prose-a:underline prose-a:underline-offset-4 prose-ul:my-3 prose-ul:list-disc prose-ul:pl-5 prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-5 prose-li:my-1 prose-code:before:content-none prose-code:after:content-none prose-pre:my-0 prose-pre:bg-transparent prose-pre:p-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeRenderer,
          pre: ({ children }) => <>{children}</>,
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => <ul>{children}</ul>,
          ol: ({ children }) => <ol>{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
