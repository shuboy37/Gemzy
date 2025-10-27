import { ai, createPartFromUri } from "@/lib/utils/geminiClient";
import { Part } from "@google/genai";

interface getFileUploadServiceProps {
  files: File[];
}

export const getFileUploadService = async ({
  files,
}: getFileUploadServiceProps) => {
  const contentArr: (string | Part)[] = [];
  const imagesArray: Part[] = [];
  for (const fileObj of files) {
    console.log("fileObj:", fileObj);

    const isImg = fileObj.type.split("/")[0] === "image" ? true : false;
    console.log(isImg);

    const buffer = await fileObj.arrayBuffer();

    const file = await ai.files.upload({
      file: new Blob([new Uint8Array(buffer)], {
        type: fileObj.type,
      }),
      config: isImg
        ? { mimeType: fileObj.type }
        : { displayName: fileObj.name },
    });
    console.log("File:", file);
    if (!isImg) {
      console.log("hi");
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
      if (getFile.state === "FAILED") {
        throw new Error("File processing failed.");
      }

      if (file.uri && file.mimeType) {
        const fileContent = createPartFromUri(file.uri, file.mimeType);
        console.log("Filecontent", fileContent);

        contentArr.push(fileContent);
        console.log("Content: ", contentArr);
      }
    } else {
      if (file.uri && file.mimeType) {
        imagesArray.push(createPartFromUri(file.uri, file.mimeType));
      }
      console.log("ImagesArr: ", imagesArray);
    }
  }
  return { contentArr, imagesArray };
};
