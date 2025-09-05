import { imageCache } from "../controllers/gemini.controller";

export const getImageById = async ({ imageId }: { imageId: string }) => {
  const imageDataSrc = imageCache.get(imageId);
  return imageDataSrc;
};
