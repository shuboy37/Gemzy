import { atomWithStorage } from "jotai/utils";

export type ChatTool = "chat" | "web-search";

export const selectedToolAtom = atomWithStorage<ChatTool>(
  "selected-tool",
  "chat"
);
