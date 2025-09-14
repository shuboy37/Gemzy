import { imageCache } from "../utils/imageCache";

export const getImageById = async ({ imageId }: { imageId: string }) => {
  const imageDataSrc = imageCache.get(imageId);

  return imageDataSrc;
};
