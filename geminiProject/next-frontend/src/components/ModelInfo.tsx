import { AIModel, getModelConfigByModel } from "@/lib/models";
import { getModelIcon } from "./ModelCompos";

export const ModelInfo = ({ model }: { model: AIModel }) => {
  const modelConfig = getModelConfigByModel(model);
  return (
    <div className="bg-background/95 hidden h-fit w-[280px] rounded-xl border border-gray-700 p-4 backdrop-blur-xl md:block">
      {/* Model Icon and Name */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100">
          {getModelIcon(modelConfig.iconType, 17)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-primary truncate text-sm font-semibold">
            {modelConfig.displayName}
          </h3>
          <p className="text-muted-foreground text-xs">{modelConfig.company}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground/90 mb-4 text-sm leading-relaxed">
        {modelConfig.description}
      </p>

      {/* Capabilities */}
      <div>
        <div className="flex flex-col gap-1.5">
          {!modelConfig.isImageGeneration && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
              <span>1 credit per message</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
