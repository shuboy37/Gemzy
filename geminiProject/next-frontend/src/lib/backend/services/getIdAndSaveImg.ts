export const getIdAndSaveImage = async ({
  imageCache,
  imageDataSrc,
}: {
  imageCache: Map<string, string>;
  imageDataSrc: string;
}) => {
  const id = `img-${Date.now()}`;

  imageCache.set(id, imageDataSrc);

  return id;
};
