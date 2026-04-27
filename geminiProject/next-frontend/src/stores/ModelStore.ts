import { AIModel } from "@/lib/models";
import {
  GUEST_DEFAULT_MODEL_ID,
  GUEST_DEFAULT_MODEL_NAME,
} from "@/lib/guest/guest-usage";
import { atomWithStorage } from "jotai/utils";

type SelectedModelProps = {
  model: AIModel;
  modelId: string;
};

export const selectedModel = atomWithStorage<SelectedModelProps>(
  "selected-model",
  { model: GUEST_DEFAULT_MODEL_NAME, modelId: GUEST_DEFAULT_MODEL_ID }
);

export const bookmarkedModelsAtom = atomWithStorage<AIModel[]>(
  "bookmarked-models",
  []
);
