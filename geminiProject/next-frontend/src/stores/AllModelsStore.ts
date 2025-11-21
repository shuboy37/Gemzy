import { atom } from "jotai";
import { ModelConfig } from "@/lib/models";

export const allModelsConfigAtom = atom<ModelConfig[]>([]);
