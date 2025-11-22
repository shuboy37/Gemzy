/**
 * Formats raw model names from OpenRouter API for clean UI display
 * Handles various edge cases and inconsistencies in model naming
 */
export const formatModelName = (rawName: string): string => {
  let formatted = rawName.trim();

  // Remove "(free)" suffix
  formatted = formatted.replace(/\s*\(free\)$/i, "");

  // Remove "(exacto)" suffix
  formatted = formatted.replace(/\s*\(exacto\)$/i, "");

  // Handle special cases with slashes instead of colons (e.g., "LiquidAI/LFM2-8B-A1B")
  if (formatted.includes("/") && !formatted.includes(":")) {
    // Replace slash with colon and space for consistency
    formatted = formatted.replace(/\//g, ": ");
  }

  // Handle models with no provider prefix (e.g., "Qwen2.5 72B Instruct")
  // These need provider inference from context, but we'll just clean them up
  if (!formatted.includes(":")) {
    // Apply basic formatting for models without provider prefix
    formatted = formatted
      // Capitalize common acronyms
      .replace(
        /\b(gpt|glm|ai|api|llm|vl|oss|afm|ernie|ui|tars|rpr|mai|ds)\b/gi,
        (match) => match.toUpperCase()
      )
      // Fix "Qwen" capitalization
      .replace(/\bqwen/gi, "Qwen");
  }

  // Fix common provider name inconsistencies
  formatted = formatted
    // Standardize "xAI" to "XAI"
    .replace(/^xAI:/, "XAI:")
    // Standardize "Z.AI" variations
    .replace(/^Z\.AI:/g, "Zhipu AI:")
    // Fix "MoonshotAI" to "Moonshot"
    .replace(/^MoonshotAI:/g, "Moonshot:")
    // Fix "NousResearch" to "Nous"
    .replace(/^NousResearch:/g, "Nous:")
    // Fix "EleutherAI" to "Eleuther"
    .replace(/^EleutherAI:/g, "Eleuther:")
    // Fix "AlfredPros" to "Alfred"
    .replace(/^AlfredPros:/g, "Alfred:")
    // Fix "AllenAI" to "Allen Institute"
    .replace(/^AllenAI:/g, "Allen Institute:")
    // Fix "AionLabs" to "Aion Labs"
    .replace(/^AionLabs:/g, "Aion Labs:")
    // Standardize "TNG"
    .replace(/^TNG:/g, "TNG Tech:")
    // Fix "ArliAI"
    .replace(/^ArliAI:/g, "Arli AI:")
    // Fix "OpenGVLab"
    .replace(/^OpenGVLab:/g, "OpenGV Lab:")
    // Fix "StepFun"
    .replace(/^StepFun:/g, "StepFun AI:")
    // Fix "TheDrummer"
    .replace(/^TheDrummer:/g, "Drummer:")
    // Fix "Sao10K"
    .replace(/^Sao10K:/g, "Sao10k:")
    // Standardize "Deep Cogito"
    .replace(/^Deep Cogito:/g, "DeepCogito:")
    // Fix "ByteDance" spacing
    .replace(/UI-TARS/g, "UI TARS")
    // Fix "Tongyi" (Alibaba model without Alibaba prefix)
    .replace(/^Tongyi /g, "Alibaba: Tongyi ");

  // Fix specific model name issues after provider prefix
  const parts = formatted.split(":");
  if (parts.length === 2) {
    let modelName = parts[1].trim();

    // Capitalize acronyms in model names
    modelName = modelName
      .replace(
        /\b(gpt|glm|ai|api|llm|vl|oss|afm|ernie|ui|tars|rpr|qwq|mai|ds|kat)\b/gi,
        (match) => match.toUpperCase()
      )
      // Fix DeepSeek "R1" variations
      .replace(/\bdeepseek r1\b/gi, "R1")
      .replace(/\bdeepseek v3/gi, "DeepSeek V3")
      .replace(/\bdeepseek v2/gi, "DeepSeek V2")
      .replace(/\bdeepseek prover/gi, "Prover")
      // Fix "o1", "o3", "o4" model names
      .replace(/\bo([0-9])/gi, "o$1")
      // Fix version patterns
      .replace(/v([0-9])/gi, "V$1")
      // Fix "Qwen" capitalization
      .replace(/\bqwen/gi, "Qwen")
      // Fix "Llama" capitalization
      .replace(/\bllama/gi, "Llama")
      // Fix "Claude" capitalization
      .replace(/\bclaude/gi, "Claude")
      // Fix "Gemini" capitalization
      .replace(/\bgemini/gi, "Gemini")
      // Fix "Mistral" capitalization
      .replace(/\bmistral/gi, "Mistral")
      // Fix "Codestral"
      .replace(/\bcodestral/gi, "Codestral")
      // Fix "Devstral"
      .replace(/\bdevstral/gi, "Devstral")
      // Fix "Magistral"
      .replace(/\bmagistral/gi, "Magistral")
      // Fix "Pixtral"
      .replace(/\bpixtral/gi, "Pixtral")
      // Fix "Mixtral"
      .replace(/\bmixtral/gi, "Mixtral")
      // Fix "Ministral"
      .replace(/\bministral/gi, "Ministral")
      // Fix "Hermes"
      .replace(/\bhermes/gi, "Hermes")
      // Fix "Nemotron"
      .replace(/\bnemotron/gi, "Nemotron")
      // Fix "Kimi"
      .replace(/\bkimi/gi, "Kimi")
      // Fix "Grok"
      .replace(/\bgrok/gi, "Grok")
      // Fix "Nova"
      .replace(/\bnova/gi, "Nova")
      // Fix "Sonar"
      .replace(/\bsonar/gi, "Sonar")
      // Fix "Phi"
      .replace(/\bphi/gi, "Phi")
      // Fix "Gemma"
      .replace(/\bgemma/gi, "Gemma")
      // Fix "Jamba"
      .replace(/\bjamba/gi, "Jamba")
      // Fix "Command"
      .replace(/\bcommand/gi, "Command")
      // Fix "Saba"
      .replace(/\bsaba/gi, "Saba")
      // Fix "Hunyuan"
      .replace(/\bhunyuan/gi, "Hunyuan")
      // Fix special lowercase patterns
      .replace(/\bgpt-oss-safeguard/gi, "GPT-OSS-Safeguard")
      .replace(/\bgpt-oss-120b/gi, "GPT-OSS-120B")
      .replace(/\bgpt-oss-20b/gi, "GPT-OSS-20B");

    // Return only the model name without company prefix
    formatted = modelName;
  }

  // Final cleanup: remove extra spaces
  formatted = formatted.replace(/\s+/g, " ").trim();

  return formatted;
};
