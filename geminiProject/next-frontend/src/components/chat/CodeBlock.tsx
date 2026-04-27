"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import ShikiHighlighter from "react-shiki";

type CodeBlockProps = {
  language: string;
  code: string;
};

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  jsx: "jsx",
  tsx: "tsx",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  md: "markdown",
  yml: "yaml",
  plaintext: "text",
};

function normalizeLanguage(language: string) {
  const normalized = language.trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized] ?? normalized ?? "text";
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const normalizedLanguage = normalizeLanguage(language || "text");
  const codeText = code.replace(/\n$/, "");

  useEffect(() => {
    if (!copied) return;

    const timeoutId = window.setTimeout(() => {
      setCopied(false);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy code block", error);
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2 text-xs text-muted-foreground">
        <span className="font-mono uppercase tracking-[0.18em]">
          {normalizedLanguage}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 font-medium transition hover:bg-accent hover:text-accent-foreground"
          aria-label={copied ? "Copied code" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="size-4" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto bg-background">
        <ShikiHighlighter
          language={normalizedLanguage}
          theme="github-dark"
          className="min-w-max bg-transparent px-4 py-4 text-sm [&_pre]:!bg-transparent [&_pre]:!p-0"
          showLanguage={false}
        >
          {codeText}
        </ShikiHighlighter>
      </div>
    </div>
  );
}
