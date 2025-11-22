import { useState, useCallback, useMemo } from "react";
import {
  LayoutGrid,
  Star,
  Bookmark,
  Funnel,
  Search,
  Check,
} from "lucide-react";
import { ModelCard } from "./ModelCard";
import { ModelInfo } from "./ModelInfo";
import { ModelMascot } from "./ModelCompos";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AIModel, AI_MODELS, getModelConfigByModel } from "@/lib/models";
import { useAtom } from "jotai";
import { selectedModel, bookmarkedModelsAtom } from "@/stores/ModelStore";
import { ConditionalTooltip } from "./ui/ConditionalTooltip";
import { useGetAllModels } from "@/hooks/useGetAllModels";

interface ModelDropdownProps {
  isPlanMode?: boolean;
}

export const ModelDropdown = ({ isPlanMode }: ModelDropdownProps) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "top" | "all" | "bookmarks" | "filters"
  >("top");
  const [model, setModel] = useAtom(selectedModel);
  const [bookmarkedModels] = useAtom(bookmarkedModelsAtom);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredModel, setHoveredModel] = useState<AIModel | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { data } = useGetAllModels();

  // Derive isImageGenMode from active filters
  const isImageGenMode = activeFilters.includes("imageGeneration");
  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => {
      const newFilters = prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter];

      // Auto-switch to filters category when filters are active
      if (newFilters.length > 0) {
        setSelectedCategory("filters");
      } else {
        setSelectedCategory("top");
      }

      return newFilters;
    });
  };

  const filterOptions = useMemo(
    () => [
      { id: "reasoning", label: "Reasoning", mascotType: "reasoning" as const },
      {
        id: "fileSupport",
        label: "File Support",
        mascotType: "file-support" as const,
      },
      { id: "fast", label: "Fast", mascotType: "fast" as const },
      { id: "premium", label: "Premium", mascotType: "premium" as const },
      {
        id: "superPremium",
        label: "Super Premium",
        mascotType: "superPremium" as const,
      },
      {
        id: "imageGeneration",
        label: "Image Generation",
        mascotType: "image-generation" as const,
      },
    ],
    []
  );

  const PLAN_MODE_ALLOWED_MODELS: AIModel[] = useMemo(
    () => [
      "Claude Haiku 4.5",
      "Claude Sonnet 4.5",
      // "Gemini 2.5 Flash",
      // "OpenAI 5 Mini",
    ],
    []
  );
  const isModelEnabled = useCallback(
    (model: AIModel) => {
      if (isImageGenMode) {
        const config = getModelConfigByModel(model, data?.allModelsConfigs);
        if (!config.isImageGeneration) return false;
      }
      if (isPlanMode) {
        if (!PLAN_MODE_ALLOWED_MODELS.includes(model)) return false;
      }
      return true;
    },
    [isImageGenMode, isPlanMode, PLAN_MODE_ALLOWED_MODELS, data]
  );

  const handleModelSelection = useCallback(
    (newModel: AIModel) => {
      if (isModelEnabled(newModel)) {
        setModel(newModel);
        setSearchQuery("");
      }
    },
    [isModelEnabled, setModel]
  );

  const groupedModels = useMemo(() => {
    const sourceModels =
      selectedCategory === "top" ? AI_MODELS : data?.allModels || [];

    // STEP 1: FILTER models
    const filteredModels = sourceModels.filter((model: AIModel) => {
      const config = getModelConfigByModel(model, data?.allModelsConfigs);
      // Filter 1: Image generation mode
      if (isImageGenMode && !config.isImageGeneration) return false;
      if (!isImageGenMode && config.isImageGeneration) return false;

      // Filter 2: Plan Mode
      if (isPlanMode && !PLAN_MODE_ALLOWED_MODELS.includes(model)) return false;

      // Filter 3: Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          config.displayName.toLowerCase().includes(query) ||
          config.company.toLowerCase().includes(query) ||
          config.description.toLowerCase().includes(query)
        );
      }

      // Filter 4: Bookmarks
      if (selectedCategory === "bookmarks" && !bookmarkedModels.includes(model))
        return false;

      // Filter 5: Active Filters
      if (activeFilters.length > 0) {
        const matchesAll = activeFilters.every((filter) => {
          switch (filter) {
            case "reasoning":
              return config.hasReasoning;
            case "fileSupport":
              return config.isFileSupported;
            case "fast":
              return config.isFast;
            case "premium":
              return config.isPremium;
            case "superPremium":
              return config.isSuperPremium;
            case "imageGeneration":
              return config.isImageGeneration;
            default:
              return true;
          }
        });
        if (!matchesAll) return false;
      }

      return true; // Include model if all filters pass
    });

    // STEP 2: GROUP by company using reduce
    const grouped = filteredModels.reduce(
      (acc, model) => {
        const config = getModelConfigByModel(model, data?.allModelsConfigs);
        const company = config.company; // "Google", "OpenAI", etc.

        if (!acc[company]) {
          acc[company] = []; // Create array if company doesn't exist
        }
        acc[company].push(model);
        return acc;
      },
      {} as Record<string, AIModel[]>
    );

    // STEP 3: SORT companies alphabetically, then sort models within each company
    const sortedGrouped = Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })) // Case-insensitive sort
      .reduce(
        (acc, company) => {
          acc[company] = grouped[company].sort((a, b) => {
            const configA = getModelConfigByModel(a, data?.allModelsConfigs);
            const configB = getModelConfigByModel(b, data?.allModelsConfigs);
            return configA.displayName.localeCompare(configB.displayName);
          });
          return acc;
        },
        {} as Record<string, AIModel[]>
      );

    return sortedGrouped;
  }, [
    searchQuery,
    isImageGenMode,
    isPlanMode,
    selectedCategory,
    bookmarkedModels,
    activeFilters,
  ]);

  const ProviderHeader: React.FC<{ company: string }> = ({ company }) => (
    <div className="mt-3 px-4 py-2 first:mt-0">
      <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {company}
      </h4>
    </div>
  );
  return (
    <div className="relative flex gap-0.5">
      <div className="z-50 flex max-h-[50vh] w-[424px] flex-col rounded-xl border-2 border-gray-700 bg-black shadow-lg">
        <div className="grid w-full flex-shrink-0 grid-cols-4 divide-x divide-gray-700 border-b-2 border-gray-700">
          <ConditionalTooltip
            content="Top Models"
            showTooltip={true}
            side="top"
            className="p-2 text-xs"
          >
            <div
              className="flex cursor-pointer items-center justify-center py-3 transition-colors hover:bg-gray-800"
              onClick={() => {
                setSelectedCategory("top");
                setActiveFilters([]);
              }}
            >
              <Star
                className={`size-5 ${
                  selectedCategory === "top"
                    ? "fill-amber-400 text-amber-400"
                    : "text-white hover:text-amber-500"
                }`}
              />
            </div>
          </ConditionalTooltip>
          <ConditionalTooltip
            content="All Models"
            showTooltip={true}
            side="top"
            className="p-2 text-xs"
          >
            <div
              className="flex cursor-pointer items-center justify-center py-3 transition-colors hover:bg-gray-800"
              onClick={() => {
                setSelectedCategory("all");
                setActiveFilters([]);
              }}
            >
              <LayoutGrid
                className={`size-5 ${
                  selectedCategory === "all"
                    ? "text-blue-400"
                    : "text-white hover:text-blue-400"
                }`}
              />
            </div>
          </ConditionalTooltip>
          <ConditionalTooltip
            content="Bookmarks"
            showTooltip={true}
            side="top"
            className="p-2 text-xs"
          >
            <div
              className="flex cursor-pointer items-center justify-center py-3 transition-colors hover:bg-gray-800"
              onClick={() => {
                setSelectedCategory("bookmarks");
                setActiveFilters([]);
              }}
            >
              <Bookmark
                className={`size-5 ${
                  selectedCategory === "bookmarks"
                    ? "fill-amber-500 text-amber-500"
                    : "text-white hover:text-amber-500"
                }`}
              />
            </div>
          </ConditionalTooltip>
          <DropdownMenu>
            <ConditionalTooltip
              content="Filters"
              showTooltip={true}
              side="top"
              className="p-2 text-xs"
            >
              <DropdownMenuTrigger asChild>
                <div className="flex cursor-pointer items-center justify-center py-3 transition-colors outline-none hover:bg-gray-800">
                  <Funnel
                    className={`size-5 ${
                      activeFilters.length > 0
                        ? "text-rose-fill-rose-400 fill-rose-400"
                        : "text-white hover:text-rose-400"
                    }`}
                  />
                </div>
              </DropdownMenuTrigger>
            </ConditionalTooltip>
            <DropdownMenuContent
              align="end"
              className="z-[100] w-56 border-gray-700 bg-black text-white"
            >
              <DropdownMenuLabel className="pointer-events-none text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Filter Models
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              {filterOptions.map((option) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={option.id}
                    checked={activeFilters.includes(option.id)}
                    onCheckedChange={() => toggleFilter(option.id)}
                    className="relative cursor-pointer gap-2 pr-9 pl-3 focus:bg-gray-800 focus:text-white [&>span:first-child]:hidden"
                  >
                    <div className="flex flex-1 items-center gap-2">
                      {option.mascotType && (
                        <ModelMascot
                          type={option.mascotType}
                          size={16}
                          className="shrink-0 text-gray-400"
                        />
                      )}
                      <span className="text-white">{option.label}</span>
                    </div>
                    <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                      {activeFilters.includes(option.id) && (
                        <Check className="size-4 text-white" strokeWidth={2} />
                      )}
                    </span>
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="w-full flex-shrink-0 border-b-2 border-gray-700">
          <span className="ml-2 flex space-x-2 p-2">
            <Search className="size-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-1 w-full bg-transparent text-white outline-none placeholder:text-gray-500"
            />
          </span>
        </div>

        <div
          className="no-scrollbar mt-1 min-h-0 flex-1 overflow-y-auto"
          onMouseLeave={() => setHoveredModel(null)}
        >
          {Object.keys(groupedModels).length > 0 ? (
            <div className="">
              {Object.entries(groupedModels).map(([company, models]) => (
                <div key={company}>
                  <ProviderHeader company={company} />
                  {models.map((modelName, index) => {
                    return (
                      <ModelCard
                        key={index}
                        model={modelName}
                        isModelSelected={model === modelName}
                        onSelect={handleModelSelection}
                        onHover={setHoveredModel}
                        allModelsConfigs={data?.allModelsConfigs}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Search className="text-muted-foreground/50 mx-auto mb-3 h-10 w-10" />
              <p className="text-muted-foreground mb-2 text-sm">
                No models found
              </p>
              <p className="text-muted-foreground/70 text-xs">
                Try adjusting your provider or search terms
              </p>
            </div>
          )}
        </div>
      </div>
      {hoveredModel && (
        <div className="hidden flex-shrink-0 md:block md:w-[280px]">
          <ModelInfo
            model={hoveredModel}
            className="absolute top-0 left-[428px] max-h-[120vh]"
          />
        </div>
      )}
    </div>
  );
};
