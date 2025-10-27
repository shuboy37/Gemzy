import { Part } from "@google/genai";
import { ai, createUserContent } from "@/lib/utils/geminiClient";

interface getGeminiServiceProps {
  effectiveModel: string;
  mergedContent: (
    | Part
    | {
        text: string;
      }
  )[];
}

export const getGeminiService = async ({
  effectiveModel,
  mergedContent,
}: getGeminiServiceProps) => {
  const response = await ai.models.generateContent({
    model: effectiveModel,
    contents: createUserContent(mergedContent),

    ...(effectiveModel === "gemini-2.0-flash-exp-image-generation" && {
      config: {
        responseModalities: ["Text", "Image"],
      },
    }),
  });
  return response;
};
