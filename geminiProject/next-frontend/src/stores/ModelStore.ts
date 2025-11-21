import { AIModel, getModelConfigByModel } from "@/lib/models";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const selectedModel = atomWithStorage<AIModel>(
  "selected-model",
  "Gemini 2.5 Flash"
);

export const modelConfigAtom = atom((get) => {
  const ourModel = get(selectedModel);
  const modelConfig = getModelConfigByModel(ourModel);
  return modelConfig;
});

export const bookmarkedModelsAtom = atomWithStorage<AIModel[]>(
  "bookmarked-models",
  []
);
