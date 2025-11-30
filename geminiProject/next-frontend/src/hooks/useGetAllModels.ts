import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  AIModel,
  MODEL_CONFIGS,
  ModelCategory,
  ModelConfig,
} from "../lib/models";
import { formatModelName } from "../lib/formatModelName";

interface OpenRouterModelArchitecture {
  modality: string;
  input_modalities: string[];
  output_modalities: string[];
  tokenizer: string;
  instruct_type: string | null;
}

interface OpenRouterModelPricing {
  prompt: string;
  completion: string;
  request: string;
  image: string;
  web_search: string;
  internal_reasoning: string;
  input_cache_read?: string;
}

interface OpenRouterTopProvider {
  context_length: number;
  max_completion_tokens: number | null;
  is_moderated: boolean;
}

interface OpenRouterDefaultParameters {
  temperature?: number | null;
  top_p?: number | null;
  frequency_penalty?: number | null;
}

interface OpenRouterModel {
  id: string;
  canonical_slug: string;
  hugging_face_id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: OpenRouterModelArchitecture;
  pricing: OpenRouterModelPricing;
  top_provider: OpenRouterTopProvider;
  per_request_limits: any | null;
  supported_parameters: string[];
  default_parameters: OpenRouterDefaultParameters;
}

interface OpenRouterApiResponse {
  data: OpenRouterModel[];
}

export const useGetAllModels = () => {
  return useQuery({
    queryKey: ["all-models"],
    queryFn: async () => {
      const response = await axios.get<OpenRouterApiResponse>(
        "https://openrouter.ai/api/v1/models"
      );
      const modelsData = response.data;
      const allModels: string[] = [];
      const allModelsConfigs: Record<string, ModelConfig> = {};

      const topModelIds = new Set<string>(
        Object.values(MODEL_CONFIGS).map((v) => v.modelId)
      );

      modelsData.data.forEach((model: OpenRouterModel) => {
        if (model.id.match(/:(free|extended|exacto)$/)) {
          return; // Skip this model entirely
        }

        const trueModelName = formatModelName(model.name);
        const isTopModel = topModelIds.has(model.id);

        // Define premium and super premium model sets
        const premiumModelIds = new Set([
          "google/gemini-2.5-flash-preview-09-2025",
          "openai/gpt-5-chat",
          "openai/o4-mini",
          "anthropic/claude-haiku-4.5",
          "qwen/qwen3-max",
          "moonshotai/kimi-k2",
          "google/gemini-2.5-flash-image", // Gemini Nano Banana
          "openai/gpt-5-image-mini",
        ]);

        const superPremiumModelIds = new Set([
          "anthropic/claude-sonnet-4",
          "anthropic/claude-sonnet-4.5",
          "google/gemini-2.5-pro",
          "x-ai/grok-4",
        ]);

        const fileUploadModelIds = new Set([
          "openai/gpt-5-image-mini",
          "openai/gpt-5-image",
          "openai/o3-deep-research",
          "openai/o4-mini-deep-research",
          "openai/gpt-5-pro",
          "anthropic/claude-sonnet-4.5",
          "google/gemini-2.5-flash-preview-09-2025",
          "google/gemini-2.5-flash-lite-preview-09-2025",
          "openai/gpt-5-chat",
          "openai/gpt-5",
          "openai/gpt-5-mini",
          "openai/gpt-5-nano",
          "anthropic/claude-opus-4.1",
          "google/gemini-2.5-flash-lite",
          "google/gemini-2.5-flash-lite-preview-06-17",
          "google/gemini-2.5-flash",
          "google/gemini-2.5-pro",
          "openai/o3-pro",
          "google/gemini-2.5-pro-preview",
          "anthropic/claude-opus-4",
          "anthropic/claude-sonnet-4",
          "google/gemini-2.5-pro-preview-05-06",
          "openai/o4-mini-high",
          "openai/o3",
          "openai/o4-mini",
          "openai/gpt-4.1",
          "openai/gpt-4.1-mini",
          "openai/gpt-4.1-nano",
          "openai/o1-pro",
          "google/gemini-2.0-flash-lite-001",
          "anthropic/claude-3.7-sonnet:thinking",
          "anthropic/claude-3.7-sonnet",
          "openai/o3-mini-high",
          "google/gemini-2.0-flash-001",
          "openai/o3-mini",
          "openai/o1",
          "openai/gpt-4o-2024-11-20",
          "anthropic/claude-3.5-haiku-20241022",
          "anthropic/claude-3.5-sonnet",
          "openai/gpt-4o-2024-08-06",
          "openai/gpt-4o-mini",
          "openai/gpt-4o-mini-2024-07-18",
          "anthropic/claude-3.5-sonnet-20240620",
          "openai/gpt-4o",
          "openai/gpt-4o:extended",
          "openai/gpt-4o-2024-05-13",
          "google/gemini-2.5-flash-preview-05-20",
          "google/gemini-2.5-flash-preview",
          "google/gemini-2.5-pro-exp-03-25",
        ]);

        const isPremiumModel = premiumModelIds.has(model.id);
        const isSuperPremiumModel = superPremiumModelIds.has(model.id);
        const isFileUploadModel = fileUploadModelIds.has(model.id);

        // Extract provider from model ID (e.g., "openai/gpt-4" -> "openai")
        const provider = model.id.split("/")[0];

        // Dynamic mapping for known providers
        const providerMappings: Record<
          string,
          { iconType: string; company: string }
        > = {
          openai: { iconType: "openai", company: "OpenAI" },
          google: { iconType: "google", company: "Google" },
          anthropic: { iconType: "anthropic", company: "Anthropic" },
          deepseek: { iconType: "deepseek", company: "DeepSeek" },
          qwen: { iconType: "qwen", company: "Alibaba" },
          "x-ai": { iconType: "x-ai", company: "XAI" },
          moonshotai: { iconType: "kimi", company: "Moonshot" },
          meta: { iconType: "meta", company: "Meta" },
          "meta-llama": { iconType: "meta", company: "Meta" },
          huggingface: { iconType: "huggingface", company: "Hugging Face" },
          mistral: { iconType: "mistral", company: "Mistral" },
          mistralai: { iconType: "mistral", company: "Mistral" },
          cohere: { iconType: "cohere", company: "Cohere" },
          ai21: { iconType: "ai21", company: "AI21 Labs" },
          together: { iconType: "together", company: "Together AI" },
          perplexity: { iconType: "perplexity", company: "Perplexity" },
          fireworks: { iconType: "fireworks", company: "Fireworks AI" },
          replicate: { iconType: "replicate", company: "Replicate" },
          stability: { iconType: "stability", company: "Stability AI" },
          runway: { iconType: "runway", company: "Runway ML" },
          minimax: { iconType: "minimax", company: "Minimax AI" },
          sarvamai: { iconType: "sarvamai", company: "Sarvam AI" },
          thudm: { iconType: "thudm", company: "THUDM" },
          "z-ai": { iconType: "z-ai", company: "THUDM" },
          skywork: { iconType: "skywork", company: "Skywork AI" },
          fuyu: { iconType: "fuyu", company: "Fuyu" },
          scb10x: { iconType: "scb10x", company: "SCB10X Labs" },
          liquid: { iconType: "liquid", company: "Liquid AI" },
          liquidai: { iconType: "liquid", company: "Liquid AI" },
          "shisa-ai": { iconType: "shisa-ai", company: "Shisa AI" },
          tngtech: { iconType: "tngtech", company: "TNG Tech" },
          openrouter: { iconType: "openrouter", company: "OpenRouter" },
          undi95: { iconType: "undi95", company: "Community" },
          thedrummer: { iconType: "thedrummer", company: "Community" },
          zhou: { iconType: "zhou", company: "Community" },
          nous: { iconType: "nous", company: "Nous Research" },
          "nous-research": { iconType: "nous", company: "Nous Research" },
          nvidia: { iconType: "openai", company: "NVIDIA" },
          "arcee-ai": { iconType: "openai", company: "Arcee AI" },
          sao10k: { iconType: "openai", company: "Sao10K" },
          raifle: { iconType: "openai", company: "rAIfle" },
          "aion-labs": { iconType: "openai", company: "Aion Labs" },
          "deep-cogito": { iconType: "openai", company: "Deep Cogito" },
          meituan: { iconType: "openai", company: "Meituan" },
          "stepfun-ai": { iconType: "openai", company: "StepFun AI" },
          baidu: { iconType: "openai", company: "Baidu" },
          microsoft: { iconType: "openai", company: "Microsoft" },
          deepcogito: { iconType: "openai", company: "Deep Cogito" },
          nousresearch: { iconType: "nous", company: "Nous Research" },
          neversleep: { iconType: "openai", company: "NeverSleep" },
          alfredpros: { iconType: "openai", company: "AlfredPros" },
          alibaba: { iconType: "qwen", company: "Alibaba" },
          allenai: { iconType: "openai", company: "Allen AI" },
          alpindale: { iconType: "openai", company: "Alpindale" },
          amazon: { iconType: "openai", company: "Amazon" },
          "anthracite-org": { iconType: "openai", company: "Anthracite" },
          arliai: { iconType: "openai", company: "Arli AI" },
          bytedance: { iconType: "openai", company: "ByteDance" },
          cognitivecomputations: {
            iconType: "openai",
            company: "Cognitive Computations",
          },
          eleutherai: { iconType: "openai", company: "EleutherAI" },
          gryphe: { iconType: "openai", company: "Gryphe" },
          "ibm-granite": { iconType: "openai", company: "IBM Granite" },
          inception: { iconType: "openai", company: "Inception" },
          inflection: { iconType: "openai", company: "Inflection AI" },
          kwaipilot: { iconType: "openai", company: "Kwai" },
          mancer: { iconType: "openai", company: "Mancer" },
          morph: { iconType: "openai", company: "Morph" },
          opengvlab: { iconType: "openai", company: "OpenGVLab" },
          relace: { iconType: "openai", company: "Relace" },
          switchpoint: { iconType: "openai", company: "Switchpoint" },
          tencent: { iconType: "openai", company: "Tencent" },
        };

        // Get mapping or create dynamic fallback
        const mapping = providerMappings[provider] || {
          iconType: "openai" as const, // Default icon
          company: provider.charAt(0).toUpperCase() + provider.slice(1), // Capitalize provider name
        };

        const { iconType, company } = mapping;

        // Determine capabilities from API data
        const architecture = model.architecture || {};
        const description = (model.description || "").toLowerCase();
        const supportedParams = model.supported_parameters || [];

        // Check if model has reasoning capability
        const hasReasoningParam =
          supportedParams.includes("reasoning") ||
          supportedParams.includes("include_reasoning");
        const hasReasoningDescription =
          description.includes("reasoning") ||
          description.includes("thinking") ||
          description.includes("chain of thought") ||
          description.includes("chain-of-thought") ||
          description.includes("cot") ||
          model.name.toLowerCase().includes("think") ||
          model.id.includes(":thinking");

        // Check if model is image generation
        const outputModalities = architecture.output_modalities || [];
        const isImageGeneration = outputModalities.includes("image");
        const image2imageGen =
          isImageGeneration &&
          (architecture.input_modalities || []).includes("image");

        // Determine if model is fast (smaller models, or description mentions fast/efficient)
        const modelName = model.name.toLowerCase();
        const isFastDescription =
          description.includes("fast") ||
          description.includes("efficient") ||
          description.includes("lightweight") ||
          description.includes("quick");
        const isSmallModel =
          modelName.includes("mini") ||
          modelName.includes("nano") ||
          modelName.includes("lite") ||
          modelName.includes("flash") ||
          (/\d+b/i.test(modelName) &&
            parseInt(modelName.match(/(\d+)b/i)?.[1] || "999") < 30);

        // Get model-specific config if it exists in top models for overrides
        const topModelConfig = Object.values(MODEL_CONFIGS).find(
          (config) => config.modelId === model.id
        );

        const hasReasoning =
          topModelConfig?.hasReasoning ??
          (hasReasoningParam || hasReasoningDescription);
        const isFast =
          topModelConfig?.isFast ?? (isFastDescription || isSmallModel);
        const imageGenCreditCost =
          (topModelConfig as any)?.imageGenCreditCost ?? 5;

        const modelConfig: ModelConfig = {
          modelId: model.id,
          provider: isTopModel ? "vercel-gateway" : "openrouter",
          fallbackProvider: isTopModel ? "openrouter" : undefined,
          category: "all",
          displayName: trueModelName,
          iconType: iconType as ModelConfig["iconType"],
          company,
          isPremium: isPremiumModel,
          isSuperPremium: isSuperPremiumModel,
          hasReasoning,
          isFileSupported: isFileUploadModel,
          isFast,
          isImageGeneration,
          image2imageGen,
          imageGenCreditCost,
          description: model.description || "",
        };

        // Use model.id as the unique key (includes :thinking, etc. suffixes)
        // This avoids collisions from duplicate canonical_slug values
        allModels.push(trueModelName);
        allModelsConfigs[model.id] = modelConfig;
      });

      return {
        allModels,
        allModelsConfigs,
      };
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: (failureCount) => failureCount < 3,
  });
};
