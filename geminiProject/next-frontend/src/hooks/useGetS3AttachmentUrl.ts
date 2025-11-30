import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface GetS3AttachmentUrlProps {
  fileKey: string;
  attachmentId: string;
}

export const useGetS3AttachmentUrl = ({
  fileKey,
  attachmentId,
}: GetS3AttachmentUrlProps) => {
  return useQuery({
    queryKey: ["s3AttachmentUrl", attachmentId],
    queryFn: async () => {
      const response = await axios.post(
        "/api/get-attachment-url",
        { fileKey: fileKey },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.url;
    },
    enabled: !!fileKey,
    staleTime: 30 * 60 * 1000,
    retry: (failureCount) => {
      return failureCount < 3;
    },
  });
};
