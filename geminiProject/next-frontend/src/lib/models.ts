import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const AI_MODELS = [
  //Standard Models
  "Claude Sonnet 4",
  "Claude Sonnet 4.5",
  "Gemini 2.5 Flash",
  "Gemini 2.5 Flash (New)",
  "Gemini 2.5 Flash Lite",
  "OpenAI 5 Mini",
  "OpenAI 5",
  "OpenAI o4-mini",
  "Open AI OSS 120B",
  "Claude Haiku 4.5",
  "DeepSeek R1 Fast",
  "DeepSeek V3.1",
  "Qwen3 Max",
  "Qwen3 235B A22B",
  "Qwen3 30B A3B Thinking 2507",
  "Gemini 2.5 Pro",
  "OpenAI 5 Nano",
  "Grok 3 Mini",
  "Grok 4",
  "Grok 4 Fast",
  "Grok Code Fast 1",
  "Kimi K2",
  "Gemini Nano Banana",
  "OpenAI GPT-5 Image Mini",

  //ALL MODELS
] as const;

export type AIModel = (typeof AI_MODELS)[number];

export const IMAGE_GEN_MODELS = [
  "Gemini Nano Banana",
  "OpenAI GPT-5 Image Mini",
] as const;

export type ImageGenModels = (typeof IMAGE_GEN_MODELS)[number];

export type ModelConfig = {
  modelId: string;
  provider: "vercel-gateway" | "openrouter";
  fallbackProvider?: "openrouter";
  iconType:
    | "google"
    | "openai"
    | "anthropic"
    | "deepseek"
    | "huggingface"
    | "qwen"
    | "meta"
    | "x-ai"
    | "kimi";
  company: string;
  displayName: string;
  isFileSupported: boolean;
  category: "top" | "all"; // Changed from "standard" to "top"
  isPremium: boolean;
  isSuperPremium: boolean;
  hasReasoning: boolean;
  isFast: boolean;
  isImageGeneration?: boolean;
  image2imageGen?: boolean;
  imageGenCreditCost?: number;
  description: string;
  maxTokens?: number;
  contextWindow?: number;
};

export type ModelCategory = "top" | "all";

export const getEffectiveProvider = async (
  modelConfig: ModelConfig,
  isCreditsExhausted: boolean
): Promise<"openrouter" | "vercel-gateway"> => {
  if (modelConfig.category === "all") {
    return "openrouter";
  }

  if (modelConfig.category === "top" && !isCreditsExhausted) {
    return modelConfig.provider; // Use the configured provider (vercel-gateway)
  }

  return modelConfig.fallbackProvider || "openrouter";
};

export const MODEL_CONFIGS = {
  "Gemini 2.5 Flash": {
    modelId: "google/gemini-2.5-flash",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    displayName: "Gemini 2.5 Flash",
    category: "top",
    iconType: "google",
    company: "Google",
    isPremium: false,
    isSuperPremium: false,
    hasReasoning: false,
    isFileSupported: true,
    isFast: true,
    description: "Fast and efficient model from Google",
  },
  "Gemini 2.5 Flash (New)": {
    modelId: "google/gemini-2.5-flash-preview-09-2025",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Gemini 2.5 Flash (New)",
    iconType: "google",
    company: "Google",
    isPremium: true,
    isSuperPremium: false,
    hasReasoning: false,
    isFileSupported: true,
    isFast: true,
    description: "Fast and efficient model from Google (New Flash Model)",
  },
  "Gemini 2.5 Flash Lite": {
    modelId: "google/gemini-2.5-flash-lite",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Gemini 2.5 Flash Lite",
    iconType: "google",
    company: "Google",
    isPremium: false,
    isSuperPremium: false,
    hasReasoning: false,
    isFileSupported: true,
    isFast: true,
    description: "Fast and efficient model from Google",
  },
  "OpenAI 5": {
    modelId: "openai/gpt-5-chat",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "OpenAI 5",
    iconType: "openai",
    company: "OpenAI",
    isPremium: true,
    isSuperPremium: false,
    hasReasoning: true,
    isFileSupported: true,
    isFast: false,
    description: "Latest OpenAI flagship model",
  },
  "OpenAI 5 Mini": {
    modelId: "openai/gpt-5-mini",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "OpenAI 5 Mini",
    iconType: "openai",
    company: "OpenAI",
    isPremium: false,
    isSuperPremium: false,
    hasReasoning: false,
    isFileSupported: true,
    isFast: true,
    description: "Efficient mini version of OpenAI 5",
  },

  "OpenAI o4-mini": {
    modelId: "openai/o4-mini",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "OpenAI o4-mini",
    iconType: "openai",
    company: "OpenAI",
    isPremium: true,
    isSuperPremium: false,
    hasReasoning: true,
    isFileSupported: true,
    isFast: true,
    description:
      "OpenAI's latest mini model with advanced reasoning capabilities and coding capabilities",
  },
  "Claude Haiku 4.5": {
    modelId: "anthropic/claude-haiku-4.5",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Claude Haiku 4.5",
    iconType: "anthropic",
    company: "Anthropic",
    isPremium: true,
    isSuperPremium: false,
    hasReasoning: true,
    isFileSupported: true,
    isFast: true,
    description:
      "Anthropic's fastest and most efficient model with frontier-level intelligence, extended thinking, and exceptional coding capabilities (200K context)",
  },
  "Claude Sonnet 4": {
    modelId: "anthropic/claude-4-sonnet",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Claude Sonnet 4",
    iconType: "anthropic",
    company: "Anthropic",
    isPremium: false,
    isSuperPremium: true,
    hasReasoning: false,
    isFileSupported: true,
    isFast: false,
    description: "Anthropic's top of the line last gen model.",
  },
  "Open AI OSS 120B": {
    modelId: "openai/gpt-oss-120b",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Open AI OSS 120B",
    iconType: "openai",
    company: "OpenAI",
    isPremium: false,
    isSuperPremium: false,
    hasReasoning: true,
    isFileSupported: false,
    isFast: true,
    description: "Fastest OSS Model by OpenAI",
  },
  "DeepSeek R1 Fast": {
    modelId: "deepseek/deepseek-r1-0528-qwen3-8b",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "DeepSeek R1 Fast",
    iconType: "deepseek",
    company: "DeepSeek",
    isPremium: false,
    isSuperPremium: false,
    hasReasoning: true,
    isFileSupported: false,
    isFast: true,
    description: "Deepseek Best in the class latest advanced reasoning model",
  },
  "DeepSeek V3.1": {
    modelId: "deepseek/deepseek-chat-v3.1",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "DeepSeek V3.1",
    iconType: "deepseek",
    company: "DeepSeek",
    isPremium: false,
    isSuperPremium: false,
    hasReasoning: false,
    isFileSupported: false,
    isFast: true,
    description: "Deepseek Best Model For Coding",
  },
  "Qwen3 Max": {
    modelId: "qwen/qwen3-max",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Qwen3 Max",
    iconType: "qwen",
    company: "Alibaba",
    isPremium: true,
    isSuperPremium: false,
    hasReasoning: true,
    isFileSupported: false,
    isFast: false,
    description:
      "Qwen3 Max is a powerful model with advanced reasoning capabilities and coding capabilities.",
  },
  "Qwen3 235B A22B": {
    modelId: "qwen/qwen3-235b-a22b:free",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Qwen3 235B A22B",
    iconType: "qwen",
    company: "Alibaba",
    isPremium: false,
    isSuperPremium: false,
    hasReasoning: true,
    isFileSupported: false,
    isFast: true,
    description:
      "Qwen3 235B A22B is a powerful model with advanced reasoning capabilities",
  },
  "Qwen3 30B A3B Thinking 2507": {
    modelId: "qwen/qwen3-30b-a3b-thinking-2507",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Qwen3 30B A3B Thinking 2507",
    iconType: "qwen",
    company: "Alibaba",
    isPremium: false,
    isSuperPremium: false,
    hasReasoning: true,
    isFileSupported: false,
    isFast: true,
    description:
      "Qwen3 30B A3B Thinking 2507 is a powerful model with advanced reasoning capabilities",
  },
  "Claude Sonnet 4.5": {
    modelId: "anthropic/claude-sonnet-4.5",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Claude Sonnet 4.5",
    iconType: "anthropic",
    company: "Anthropic",
    isPremium: false,
    isSuperPremium: true,
    hasReasoning: false,
    isFileSupported: true,
    isFast: false,
    description: "Best in the class Anthropic model with advanced reasoning",
  },
  "Gemini 2.5 Pro": {
    modelId: "google/gemini-2.5-pro",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Gemini 2.5 Pro",
    iconType: "google",
    company: "Google",
    isPremium: false,
    isSuperPremium: true,
    hasReasoning: true,
    isFileSupported: true,
    isFast: false,
    description:
      "Best in the class Google model with advanced reasoning and coding capabilities",
  },
  "OpenAI 5 Nano": {
    modelId: "openai/gpt-5-nano",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "OpenAI 5 Nano",
    iconType: "openai",
    company: "OpenAI",
    isPremium: false,
    isSuperPremium: false,
    hasReasoning: false,
    isFileSupported: true,
    isFast: true,
    description: "Fastest model from OpenAI.",
  },
  "Grok 3 Mini": {
    modelId: "x-ai/grok-3-mini-beta",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Grok 3 Mini",
    iconType: "x-ai",
    company: "XAI",
    isPremium: false,
    isSuperPremium: false,
    hasReasoning: true,
    isFileSupported: false,
    isFast: true,
    description: "Fastest model from XAI with advanced reasoning.",
  },
  "Grok 4": {
    modelId: "x-ai/grok-4",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Grok 4",
    iconType: "x-ai",
    company: "XAI",
    isPremium: false,
    isSuperPremium: true,
    hasReasoning: true,
    isFileSupported: false,
    isFast: false,
    description:
      "Last Gen model from XAI with advanced reasoning and coding capabilities.",
  },
  "Grok 4 Fast": {
    modelId: "x-ai/grok-4-fast",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Grok 4 Fast",
    iconType: "x-ai",
    company: "XAI",
    isPremium: false,
    isSuperPremium: false,
    hasReasoning: true,
    isFileSupported: true,
    isFast: true,
    description: "Last Gen model from XAI with faster reasoning.",
  },
  "Grok Code Fast 1": {
    modelId: "x-ai/grok-code-fast-1",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Grok Code Fast 1",
    iconType: "x-ai",
    company: "XAI",
    isPremium: false,
    isSuperPremium: false,
    hasReasoning: true,
    isFileSupported: false,
    isFast: true,
    description: "Fastest model from XAI with advanced reasoning.",
  },
  "Kimi K2": {
    modelId: "moonshotai/kimi-k2-0905",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Kimi K2",
    iconType: "kimi",
    company: "Moonshot",
    isPremium: true,
    isSuperPremium: false,
    hasReasoning: false,
    isFileSupported: false,
    isFast: true,
    description: "Fastest model from Moonshot.",
  },
  "Gemini Nano Banana": {
    modelId: "google/gemini-2.5-flash-image-preview",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "Gemini Nano Banana",
    iconType: "google",
    company: "Google",
    isPremium: true,
    isSuperPremium: false,
    hasReasoning: false,
    isFileSupported: true,
    isFast: true,
    isImageGeneration: true,
    image2imageGen: true,
    imageGenCreditCost: 10,
    description:
      "Fast AI image generation with Gemini 2.5 Flash via OpenRouter",
  },
  "OpenAI GPT-5 Image Mini": {
    modelId: "openai/gpt-5-image-mini",
    provider: "vercel-gateway",
    fallbackProvider: "openrouter",
    category: "top",
    displayName: "OpenAI GPT-5 Image Mini",
    iconType: "openai",
    company: "OpenAI",
    isPremium: true,
    isSuperPremium: false,
    hasReasoning: false,
    isFileSupported: true,
    isFast: false,
    isImageGeneration: true,
    image2imageGen: true,
    imageGenCreditCost: 5,
    description:
      "Fast and efficient image generation from OpenAI via OpenRouter",
  },
} as const satisfies Record<AIModel, ModelConfig>;

let ALL_MODELS: ModelConfig[] = [];

export const getAllModels = async (): Promise<ModelConfig[]> => {
  if (ALL_MODELS.length > 0) {
    return ALL_MODELS;
  }

  const allModels = useQuery({
    queryKey: ["all-models", ALL_MODELS.length],
    queryFn: async () => {
      const data = await axios.get("https://openrouter.ai/api/v1/models");
      return data;
    },
    enabled: ALL_MODELS.length === 0,
    staleTime: 24 * 60 * 60 * 1000,
    retry: (failureCount) => {
      return failureCount < 3;
    },
  });

  ALL_MODELS = allModels.data?.data.map((model: any) => {
    const topModelIds = new Set(
      Object.values(MODEL_CONFIGS).map((v) => v.modelId)
    );
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
      huggingface: { iconType: "huggingface", company: "Hugging Face" },
      mistral: { iconType: "mistral", company: "Mistral" },
      cohere: { iconType: "cohere", company: "Cohere" },
      ai21: { iconType: "ai21", company: "AI21 Labs" },
      together: { iconType: "together", company: "Together AI" },
      perplexity: { iconType: "perplexity", company: "Perplexity" },
      fireworks: { iconType: "fireworks", company: "Fireworks AI" },
      replicate: { iconType: "replicate", company: "Replicate" },
      stability: { iconType: "stability", company: "Stability AI" },
      runway: { iconType: "runway", company: "Runway ML" },

      // Other major and regional providers
      minimax: { iconType: "minimax", company: "Minimax AI" },
      sarvamai: { iconType: "sarvamai", company: "Sarvam AI" },
      thudm: { iconType: "thudm", company: "THUDM/GLM" },
      skywork: { iconType: "skywork", company: "Skywork AI" },
      fuyu: { iconType: "fuyu", company: "Fuyu" },
      scb10x: { iconType: "scb10x", company: "SCB10X Labs" },
      liquid: { iconType: "liquid", company: "Liquid Intelligence" },
      "z-ai": { iconType: "z-ai", company: "Various/China" },
      "shisa-ai": { iconType: "shisa-ai", company: "Shisa AI" },
      tngtech: { iconType: "tngtech", company: "TNG Tech" },
      openrouter: { iconType: "openrouter", company: "OpenRouter" },
      undi95: { iconType: "undi95", company: "Community" },
      thedrummer: { iconType: "thedrummer", company: "Community" },
      zhou: { iconType: "zhou", company: "Chinese models" },
      nous: { iconType: "nous", company: "Nous Research" },
    };

    // Get mapping or create dynamic fallback
    const mapping = providerMappings[provider] || {
      iconType: "openai" as const, // Default icon
      company: provider.charAt(0).toUpperCase() + provider.slice(1), // Capitalize provider name
    };

    const { iconType, company } = mapping;

    // Get model-specific config if it exists in top models, otherwise use defaults for "all" models
    const topModelConfig = Object.values(MODEL_CONFIGS).find(
      (config) => config.modelId === model.id
    );
    const hasReasoning = topModelConfig?.hasReasoning ?? false;
    const isFast = topModelConfig?.isFast ?? false;
    const isImageGeneration =
      (topModelConfig as any)?.isImageGeneration ?? false;
    const image2imageGen = (topModelConfig as any)?.image2imageGen ?? false;
    const imageGenCreditCost = (topModelConfig as any)?.imageGenCreditCost ?? 5;

    return {
      modelId: model.id,
      provider: isTopModel ? "vercel-gateway" : "openrouter",
      fallbackProvider: isTopModel ? "openrouter" : undefined,
      category: "all",
      displayName: model.name,
      iconType,
      company,
      isPremium: isPremiumModel,
      isSuperPremium: isSuperPremiumModel,
      hasReasoning,
      isFileUploadModel,
      isFast,
      isImageGeneration,
      image2imageGen,
      imageGenCreditCost,
      description: model.description || "",
    };
  });
  return ALL_MODELS;
};
