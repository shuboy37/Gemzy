import { AIModel } from "@/lib/models";
import { atomWithStorage } from "jotai/utils";

type SelectedModelProps = {
  model: AIModel;
  modelId: string;
};

export const selectedModel = atomWithStorage<SelectedModelProps>(
  "selected-model",
  { model: "Gemini 2.5 Flash", modelId: "google/gemini-2.5-flash" }
);

export const bookmarkedModelsAtom = atomWithStorage<AIModel[]>(
  "bookmarked-models",
  []
);
