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
] as const;

export type AIModel = (typeof AI_MODELS)[number] | string;
export type ALL_MODEL_CONFIGS = Record<string, ModelConfig>;

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

export const getEffectiveProvider = (
  modelConfig: ModelConfig,
  isCreditsExhausted: boolean
) => {
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

export const getModelsByCategory = (
  category: ModelCategory,
  models?: ModelConfig[]
): ModelConfig[] => {
  if (category === "all") {
    return models || [];
  }
  if (category === "top") {
    return Object.values(MODEL_CONFIGS);
  }
  return [];
};

export const getModelConfigByModel = (
  modelName: AIModel,
  allModelsConfigs?: ALL_MODEL_CONFIGS
): ModelConfig => {
  // First, check top models by display name (for backwards compatibility)
  const topConfigByName =
    MODEL_CONFIGS[modelName as keyof typeof MODEL_CONFIGS];
  if (topConfigByName) return topConfigByName;

  // Finally, check all models by modelId (key) or displayName (search)
  if (allModelsConfigs) {
    const foundByDisplayName = Object.values(allModelsConfigs).find(
      (config) => config.displayName === modelName
    );
    if (foundByDisplayName) return foundByDisplayName;
  }

  console.warn(
    `Model config not found for: ${modelName}. Falling back to default.`
  );
  // Return a fallback config for the first available model
  return MODEL_CONFIGS["Gemini 2.5 Flash Lite"];
};
