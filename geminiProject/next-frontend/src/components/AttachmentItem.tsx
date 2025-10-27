import { X } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Attachment, LocalAttachment } from "@/hooks/use-attachments";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

interface AttachmentItemProps {
  attachment: Attachment | LocalAttachment;
  onRemove?: () => void;
}

export const AttachmentItem = ({
  attachment,
  onRemove,
}: AttachmentItemProps) => {
  if (attachment.type === "image") {
    return <ImageAttachment attachment={attachment} onRemove={onRemove} />;
  }

  return <DocumentAttachment attachment={attachment} onRemove={onRemove} />;
};

// 📄 Document Attachment Component
function DocumentAttachment({
  attachment,
  onRemove,
}: {
  attachment: Attachment | LocalAttachment;
  onRemove?: () => void;
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return "🎥";
      case "pdf":
        return "📄";
      case "docx":
        return "📝";
      default:
        return "📎";
    }
  };

  return (
    <div className="flex w-fit items-center gap-2 rounded-lg bg-pink-100 px-3 py-2">
      <span className="text-base">{getIcon(attachment.type)}</span>

      <span className="max-w-[120px] truncate text-sm font-medium text-stone-700">
        {attachment.title}
      </span>

      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 rounded-full p-1 hover:bg-red-300"
        >
          <X className="size-3 text-red-600" />
        </button>
      )}
    </div>
  );
}

// 🖼️ Image Attachment Component
function ImageAttachment({
  attachment,
  onRemove,
}: {
  attachment: Attachment | LocalAttachment;
  onRemove?: () => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isUploading =
    "uploadProgress" in attachment &&
    !attachment.isUploadDone &&
    attachment.uploadProgress < 100;
  const uploadProgress =
    "uploadProgress" in attachment ? attachment.uploadProgress : 0;

  // Fetch presigned URL when fileKey is available

  const getImageURL = useQuery({
    queryKey: ["presigned-img-url", attachment.id],
    queryFn: async () => {
      if ("fileKey" in attachment && attachment.fileKey) {
        const data = await axios.post(
          "/api/get-image-url",
          { fileKey: attachment.fileKey },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        return data.data.url;
      }
      return;
    },

    enabled: "fileKey" in attachment && !!attachment.fileKey,
    staleTime: 30 * 60 * 1000,
    retry: (failureCount) => {
      return failureCount < 3;
    },
  });

  const getImageUrl = () => {
    if (getImageURL.error) {
      console.error("Failed to fetch presigned URL");
      toast.error("Failed to load image, please try again later.");
    }

    // 1. If we have presigned S3 URL (most secure)
    if (getImageURL.data) {
      return getImageURL.data;
    }

    // 2. If it's a LocalAttachment with localUrl (during upload)
    if ("localUrl" in attachment && attachment.localUrl) {
      return attachment.localUrl;
    }

    return "/placeholder-image.png"; // Fallback
  }; // Progress circle calculation
  const circumference = 2 * Math.PI * 12;
  const strokeDashoffset =
    circumference - (uploadProgress / 100) * circumference;

  return (
    <div className="relative flex size-32 flex-col gap-2 rounded-lg bg-stone-200">
      <div className="relative">
        {/* Image with Click-to-Zoom */}
        <Dialog open={isModalOpen}>
          <DialogTrigger asChild>
            <button
              className="group size-32 cursor-pointer overflow-hidden rounded-md focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              <img
                src={getImageUrl()}
                alt={attachment.title}
                draggable={false}
                className="size-32 rounded-md object-cover object-center transition-transform duration-300 ease-out group-hover:scale-110"
              />
            </button>
          </DialogTrigger>

          {/* Full-screen Modal */}
          <DialogContent
            noClose
            className="h-fit max-h-[90vh] w-full max-w-6xl border-none bg-black/90 p-4"
          >
            <DialogTitle className="sr-only">Image Zoom View</DialogTitle>
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="relative">
                <img
                  src={getImageUrl()}
                  alt={attachment.title}
                  className="max-h-[80vh] max-w-full rounded-lg object-contain"
                />
                <DialogClose asChild>
                  <button
                    className="absolute top-4 right-4 z-50 rounded-full bg-red-500 p-2 text-white shadow-[0_2px_0_#FFF] backdrop-blur-sm transition-all hover:bg-red-400"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <X className="size-5" />
                  </button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
            <div className="relative flex items-center justify-center">
              <div className="h-10 w-10">
                <svg className="h-full w-full -rotate-90">
                  <circle
                    className="text-white/30"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="transparent"
                    r="12"
                    cx="20"
                    cy="20"
                  />
                  <circle
                    className="text-white transition-all duration-200"
                    strokeWidth="2"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="12"
                    cx="20"
                    cy="20"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Remove Button */}
        {onRemove && !isUploading && (
          <button
            onClick={onRemove}
            className="absolute top-1.5 right-1.5 z-20 flex size-6 shrink-0 items-center justify-center rounded-full border border-white/20 bg-red-500 text-white shadow-lg hover:bg-red-600"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
