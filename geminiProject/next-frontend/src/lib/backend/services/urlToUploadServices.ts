import { Part } from "@google/genai";
import { ai, createPartFromUri } from "@/lib/backend/utils/geminiClient";
interface UrlToUploadServcieProps {
  input: string;
  matches: string[];
}

export const getUrlToUploadService = async ({
  input,
  matches,
}: UrlToUploadServcieProps) => {
  const urls = matches.map((url: string) =>
    url.startsWith("http") ? url : "https://" + url
  );
  let cleanedPrompt = input;
  const content: (string | Part)[] = [];
  for (const url of urls) {
    cleanedPrompt = cleanedPrompt.replace(url, "").trim();
  }

  content.push(cleanedPrompt);

  for (const url of urls) {
    const displayName =
      url.split("/").pop()?.split("?")[0].split("#")[0] ?? "file.pdf";
    const pdfBuffer = await fetch(url).then((response) =>
      response.arrayBuffer()
    );

    const fileBlob = new Blob([pdfBuffer], { type: "application/pdf" });

    const file = await ai.files.upload({
      file: fileBlob,
      config: { displayName },
    });

    if (!file.name) {
      throw new Error("File name is missing!");
    }
    let getFile = await ai.files.get({ name: file.name });

    while (getFile.state === "PROCESSING") {
      getFile = await ai.files.get({ name: file.name });
      console.log(`current file status: ${getFile.state}`);
      console.log("File is still processing, retrying in 5 seconds");

      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });
    }
    if (file.state === "FAILED") {
      throw new Error("File processing failed.");
    }

    if (file.uri && file.mimeType) {
      const fileContent = createPartFromUri(file.uri, file.mimeType);
      content.push(fileContent);
    }
  }
  return content;
};
