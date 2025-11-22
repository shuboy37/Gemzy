import {
  AIModel,
  getModelConfigByModel,
  ALL_MODEL_CONFIGS,
} from "@/lib/models";
import { Check, Bookmark } from "lucide-react";
import { ModelMascot, getModelIcon } from "./ModelCompos";
import { ConditionalTooltip } from "./ui/ConditionalTooltip";
import { useAtom } from "jotai";
import { bookmarkedModelsAtom } from "@/stores/ModelStore";

interface ModelCardProps {
  onSelect: (model: AIModel) => void;
  model: AIModel;
  isModelSelected: boolean;
  onHover: (model: AIModel | null) => void;
  allModelsConfigs?: ALL_MODEL_CONFIGS;
}

export const ModelCard = ({
  model,
  isModelSelected,
  onSelect,
  onHover,
  allModelsConfigs,
}: ModelCardProps) => {
  const modelConfig = getModelConfigByModel(model, allModelsConfigs);
  const [bookmarkedModels, setBookmarkedModels] = useAtom(bookmarkedModelsAtom);
  const isBookmarked = bookmarkedModels.includes(model);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBookmarked) {
      setBookmarkedModels(bookmarkedModels.filter((m) => m !== model));
    } else {
      setBookmarkedModels([...bookmarkedModels, model]);
    }
  };

  return (
    <div
      onClick={() => onSelect(model)}
      onMouseEnter={() => onHover(model)}
      onMouseLeave={() => onHover(null)}
      className={
        "group relative mx-2 flex cursor-pointer items-center justify-between rounded-lg border border-transparent px-1 py-0.5 transition-all duration-300 " +
        (isModelSelected
          ? "border-gray-700 bg-gray-700"
          : "hover:border-gray-700/65 hover:bg-gray-700/65")
      }
    >
      <div className="flex flex-1 items-center gap-2">
        {/* Provider Icon */}
        <div className="flex h-8 w-4 items-center justify-center rounded-full transition-all duration-300">
          {getModelIcon(modelConfig.iconType, 12)}
        </div>

        {/* Model Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-primary max-w-32 truncate text-[12px] font-semibold md:max-w-none">
              {modelConfig.displayName}
            </h3>
          </div>
        </div>
      </div>

      {/* Right side - Badges and Selection */}
      <div className="flex items-center gap-3">
        {/* Model Badges Stack */}
        <div className="flex items-center divide-x divide-gray-700/50 overflow-hidden rounded-md border border-gray-700/50 bg-gray-800/30">
          {/* Bookmark Icon */}
          <div
            onClick={toggleBookmark}
            className="group/bookmark flex h-6 w-6 cursor-pointer items-center justify-center transition-colors hover:bg-gray-700/50"
          >
            <Bookmark
              className={`h-3.5 w-3.5 transition-colors ${
                isBookmarked
                  ? "fill-amber-500 text-amber-500"
                  : "text-gray-400 group-hover/bookmark:text-amber-500"
              }`}
            />
          </div>

          {modelConfig.isSuperPremium && (
            <div className="group/super flex h-6 w-6 cursor-help items-center justify-center transition-colors hover:bg-gray-700/50">
              <ConditionalTooltip
                content="Super Premium"
                showTooltip={true}
                side="top"
                arrowClassName="opacity-0"
                className="p-1 text-[10px]"
              >
                <div>
                  <ModelMascot
                    type="superPremium"
                    size={16}
                    className="text-gray-400 transition-colors group-hover/super:text-indigo-400"
                  />
                </div>
              </ConditionalTooltip>
            </div>
          )}
          {modelConfig.isPremium && !modelConfig.isSuperPremium && (
            <div className="group/premium flex h-6 w-6 cursor-help items-center justify-center transition-colors hover:bg-gray-700/50">
              <ConditionalTooltip
                content="Premium"
                showTooltip={true}
                side="top"
                arrowClassName="opacity-0"
                className="p-1 text-[10px]"
              >
                <div>
                  <ModelMascot
                    type="premium"
                    size={16}
                    className="text-gray-400 transition-colors group-hover/premium:text-sky-400"
                  />
                </div>
              </ConditionalTooltip>
            </div>
          )}
          {modelConfig.hasReasoning && (
            <div className="group/reasoning flex h-6 w-6 cursor-help items-center justify-center transition-colors hover:bg-gray-700/50">
              <ConditionalTooltip
                content="Reasoning"
                showTooltip={true}
                side="top"
                arrowClassName="opacity-0"
                className="p-1 text-[10px]"
              >
                <div>
                  <ModelMascot
                    type="reasoning"
                    size={16}
                    className="text-gray-400 transition-colors group-hover/reasoning:text-rose-400"
                  />
                </div>
              </ConditionalTooltip>
            </div>
          )}
          {modelConfig.isFast && (
            <div className="group/fast flex h-6 w-6 cursor-help items-center justify-center transition-colors hover:bg-gray-700/50">
              <ConditionalTooltip
                content="Fast"
                showTooltip={true}
                side="top"
                arrowClassName="opacity-0"
                className="p-1 text-[10px]"
              >
                <div>
                  <ModelMascot
                    type="fast"
                    size={16}
                    className="text-gray-400 transition-colors group-hover/fast:text-yellow-400"
                  />
                </div>
              </ConditionalTooltip>
            </div>
          )}
          {modelConfig.isFileSupported && (
            <div className="group/file flex h-6 w-6 cursor-help items-center justify-center transition-colors hover:bg-gray-700/50">
              <ConditionalTooltip
                content="File Support"
                showTooltip={true}
                side="top"
                arrowClassName="opacity-0"
                className="p-1 text-[10px]"
              >
                <div>
                  <ModelMascot
                    type="file-support"
                    size={16}
                    className="text-gray-400 transition-colors group-hover/file:text-blue-400"
                  />
                </div>
              </ConditionalTooltip>
            </div>
          )}
        </div>

        {/* Selection Indicator */}
        <div
          className={
            "flex size-4 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-5 sm:w-5 " +
            (isModelSelected
              ? "border-gray-700 bg-gray-700"
              : "border-border/50 group-hover:border-gray-700/65")
          }
        >
          {isModelSelected && (
            <Check className="size-2.5 text-green-500 sm:h-3 sm:w-3" />
          )}
        </div>
      </div>
    </div>
  );
};
