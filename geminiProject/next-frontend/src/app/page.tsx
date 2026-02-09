"use client";

import { useState } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { NavBar } from "@/components/ui/NavBar";
import dynamic from "next/dynamic";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import ChatInterface from "@/components/ChatInterface";
import { AttachmentsProvider } from "@/hooks/use-attachments";
import { lexicalConfig } from "@/lib/lexical-config";

const initialConfig = {
  namespace: "chat-input",
  theme: {
    text: {
      bold: "font-bold",
      italic: "italic",
      underline: "underline",
    },
  },
  onError: (error: Error) => {
    console.error("[Chat Editor Error]", error);
  },
  nodes: [],
};

export default function Home() {
  const [isCollapsible, setIsCollapsible] = useState(false);

  return (
    <div className="flex h-screen items-center">
      <div>
        <Sidebar
          isCollapsible={isCollapsible}
          setIsCollapsible={setIsCollapsible}
        />
      </div>
      <div className="flex h-full w-full flex-1 flex-col items-center overflow-hidden">
        <div className="h-20 w-full">
          <NavBar
            isCollapsible={isCollapsible}
            setIsCollapsible={setIsCollapsible}
          />
        </div>
        <div className="min-h-0 w-full flex-1 overflow-y-auto">
          <AttachmentsProvider>
            <LexicalComposer initialConfig={lexicalConfig}>
              <ChatInterface />
            </LexicalComposer>
          </AttachmentsProvider>
        </div>
      </div>
    </div>
  );
}
