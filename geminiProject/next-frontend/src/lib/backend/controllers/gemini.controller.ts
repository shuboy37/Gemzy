import { Part } from "@google/genai";
import { getUrlToUploadService } from "@/lib/backend/services/urlToUploadServices";
import { getFileUploadService } from "@/lib/backend/services/fileUploadService";
import { getImageGenService } from "@/lib/backend/services/imageServices";
import { getGeminiService } from "@/lib/backend/services/geminiSdkService";
import { getIdAndSaveImage } from "@/lib/backend/services/getIdAndSaveImg";

export const imageCache = new Map<string, string>();

export const handleGemini = (
  input: string,
  effectiveModel: string,
  files: File[]
): ReadableStream => {
  return new ReadableStream({
    async start(controller) {
      try {
        console.log(
          `[handleGemini] Starting process for model: ${effectiveModel}`
        );
        let content: (string | Part)[] = [];
        let imagesArr: Part[] = [];

        const regex =
          /(?:https?:\/\/)?(?:www\.)?[\w-]+(?:\.[\w.-]+)+(?:\/[\w\-./?%&=]*)?\.pdf/gi;
        const matches = input.match(regex);

        if (matches) {
          console.log("[handleGemini] PDF URLs found, processing...");
          content = await getUrlToUploadService({ input, matches });
        }

        if (files.length > 0) {
          console.log(
            `[handleGemini] ${files.length} files found, processing...`
          );
          const { contentArr, imagesArray } = await getFileUploadService({
            files,
          });
          if (contentArr.length) content.push(...contentArr);
          if (imagesArray.length) imagesArr.push(...imagesArray);
        }

        const mergedContent = [
          { text: input.trim() },
          ...content.filter((cont) => typeof cont !== "string"),
          ...imagesArr,
        ];

        console.log("[handleGemini] Sending request to Gemini service...");
        const response = await getGeminiService({
          effectiveModel,
          mergedContent,
        });
        console.log("[handleGemini] Received response from Gemini service.");

        let finalResult;
        if (effectiveModel === "gemini-2.0-flash-exp-image-generation") {
          const { finalResponse, textWithPic, imageDataSrc } =
            await getImageGenService(response);
          const imgId = await getIdAndSaveImage({ imageCache, imageDataSrc });
          finalResult = {
            response: finalResponse,
            textWithPic,
            imgId,
            effectiveModel,
          };
        } else {
          finalResult = { response: response.text, effectiveModel };
        }

        console.log("[handleGemini] Final result:", finalResult);

        const chunk =
          JSON.stringify({
            type: "final_gemini_response",
            data: finalResult,
          }) + "\n";
        console.log(chunk);

        controller.enqueue(new TextEncoder().encode(chunk));

        controller.close();
        console.log("[handleGemini] Sent single chunk and closed stream.");
      } catch (error) {
        console.error("[handleGemini] Error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred in the Gemini handler.";

        const jsonError =
          JSON.stringify({ type: "error", message: errorMessage }) + "\n";

        controller.enqueue(new TextEncoder().encode(jsonError));
        controller.close();
      }
    },
  });
};
