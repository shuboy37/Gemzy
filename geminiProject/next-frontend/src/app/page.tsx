"use client";

import { Sidebar } from "@/components/ui/Sidebar";
import { NavBar } from "@/components/ui/NavBar";
import dynamic from "next/dynamic";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import ChatInterface from "@/components/ChatInterface";
import { AttachmentsProvider } from "@/hooks/use-attachments";
import { lexicalConfig } from "@/lib/lexical-config";

// const ChatInterface = dynamic(() => import("@/components/ChatInterface"), {
//   loading: () => (
//     <div className="flex h-64 w-full items-center justify-center">
//       <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
//     </div>
//   ),
// });

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
  return (
    <div className="flex h-screen items-center">
      <div>
        <Sidebar />
      </div>
      <div className="flex h-full w-full flex-1 flex-col items-center justify-between space-y-36 overflow-y-auto">
        <div className="w-full">
          <NavBar />
        </div>
        <AttachmentsProvider>
          <LexicalComposer initialConfig={lexicalConfig}>
            <ChatInterface />{" "}
          </LexicalComposer>
        </AttachmentsProvider>
      </div>
    </div>
  );
}
