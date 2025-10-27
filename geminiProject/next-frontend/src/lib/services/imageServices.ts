import { GenerateContentResponse } from "@google/genai";

export const getImageGenService = async (response: GenerateContentResponse) => {
  let finalResponse = "";
  let imageDataSrc = "";
  let textWithPic = false;
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    // Based on the part type, either show the text or save the image
    if (part.text) {
      finalResponse = part.text;
      textWithPic = true;
      // console.log("hi");
    } else if (part.inlineData) {
      const metaData = part.inlineData.mimeType;
      const imageData = part.inlineData.data;

      imageDataSrc = `data:${metaData};base64,${imageData}`;
      console.log("Image saved as gemini-native-image.png");
    }
    console.log(part);
  }

  return { finalResponse, textWithPic, imageDataSrc };
};
