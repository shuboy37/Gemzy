import {
  GoogleGenAI,
  createPartFromUri,
  createUserContent,
} from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: `${process.env.GEMINI_APIKEY}`,
});

export { createPartFromUri };
export { createUserContent };
