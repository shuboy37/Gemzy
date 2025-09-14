"use client";

import { useEffect, useState } from "react";
// import { useEffect } from "react";
import { Textarea } from "@/components/ui/TextArea";
import { PromptInputWithActions } from "@/components/inputBox-demo";
import { Orb } from "@/components/ui/Orb";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { error } from "console";
import { ImageDownIcon } from "lucide-react";

interface ChatInterfaceProps {}

export default function ChatInterface({}: ChatInterfaceProps) {
  const [response, setResponse] = useState("");
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gemini-2.0-flash");
  const [imageDataSrc, setImageDataSrc] = useState<string | undefined>("");
  // const [optimizedImageSrc, setOptimizedImageSrc] = useState<string | null>(
  //   null
  // );
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [onlyText, setOnlyText] = useState(false);

  // Convert data URL to blob URL for Next.js Image optimization
  // useEffect(() => {
  //   if (imageDataSrc && imageDataSrc.startsWith("data:")) {
  //     // Convert data URL to blob
  //     fetch(imageDataSrc)
  //       .then((res) => res.blob())
  //       .then((blob) => {
  //         const blobUrl = URL.createObjectURL(blob);
  //         setOptimizedImageSrc(blobUrl);
  //       })
  //       .catch((error) => {
  //         console.error("Error converting data URL to blob:", error);
  //         setOptimizedImageSrc(null);
  //       });
  //   } else {
  //     setOptimizedImageSrc(imageDataSrc || null);
  //   }

  //   // Cleanup blob URL when component unmounts or imageDataSrc changes
  //   return () => {
  //     if (optimizedImageSrc && optimizedImageSrc.startsWith("blob:")) {
  //       URL.revokeObjectURL(optimizedImageSrc);
  //     }
  //   };
  // }, [imageDataSrc]);

  const imgURLFetcher = useMutation({
    mutationFn: async (imgID: string) => {
      const imgBody = await axios.post(
        "/api/image",
        { imageId: imgID },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return imgBody.data;
    },
    onSuccess: (data) => {
      setImageDataSrc(data.imageDataSrc);
    },
    onError: (error) => {
      console.error("Failed to fetch image:", error);
      console.error("Error details:", error.message);
    },
  });

  const queryFetcher = useMutation({
    mutationKey: ["response"],
    onMutate: async (data) => {
      if (!data.input.trim() && data.files.length === 0) {
        return;
      }

      setResponse("Thinking....");
      setImageDataSrc(undefined);
      setOnlyText(false);

      setInput("");
      setFiles([]);

      return { previousInput: data.input, previousFiles: data.files };
    },

    mutationFn: async (data: {
      input: string;
      model: string;
      files: File[];
    }) => {
      const formdata = new FormData();
      formdata.append("input", data.input);
      formdata.append("model", data.model);
      data.files.forEach((file) => {
        formdata.append("files", file);
      });
      const stream = await fetch("/api/response", {
        method: "POST",
        body: formdata,
      });
      const reader = stream.body?.getReader();
      if (!reader) {
        throw new Error("Could not read response stream.");
      }
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader.read();
        console.log(value);
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log(chunk);
        for (const line of chunk.trim().split("\n")) {
          try {
            console.log(line);
            const json = JSON.parse(line);
            console.log(json);
            if (json.type === "delta") {
              setResponse((prev) => {
                if (prev === "Thinking....") {
                  return json.content;
                }
                return prev + json.content;
              });
            } else if (json.type === "final_gemini_response") {
              setResponse(json.data.response);
              setOnlyText(json.data.textWithPic);
              if (json.data.imgId) {
                const imgID = json.data.imgId;
                imgURLFetcher.mutate(imgID);
              }
              setModel(json.data.effectiveModel);
            } else if (json.type === "meta") {
              setModel(json.model);
            } else if (json.type === "error") {
              throw new Error(json.message);
            }
          } catch (e) {
            throw new Error(`Failed to parse stream chunk: ${line}`);
          }
        }
      }
    },
    onError: (error, variables, context) => {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setResponse(`Error: ${errorMessage}`);
      if (context) {
        setInput(context.previousInput);
        setFiles(context.previousFiles);
      }
    },
  });

  const onSubmitHandler = () => {
    queryFetcher.mutate({
      input: input,
      model: model,
      files: files,
    });
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex h-full w-full flex-col items-center space-y-20 pb-16">
      {!response && (
        <div className="relative flex items-center justify-center space-x-5">
          <Orb className="absolute -z-10 translate-y-1" />
          <h1 className="text-center text-2xl leading-tight font-semibold text-pretty whitespace-pre-wrap text-white select-none sm:text-3xl md:text-4xl lg:text-5xl">
            Say it. I'll make it real.
          </h1>
        </div>
      )}
      <div className="w-full max-w-4xl items-center">
        <div className="flex w-full items-center justify-center">
          <PromptInputWithActions
            model={model}
            setModel={setModel}
            files={files}
            setFiles={setFiles}
            onChange={(e) => handleOnChange(e)}
            value={input}
            loading={queryFetcher.isPending}
            onSubmit={onSubmitHandler}
            disabled={queryFetcher.isPending}
          />
        </div>
      </div>

      <div className="mt-10 flex w-full max-w-3xl flex-col items-center space-y-6 bg-black">
        {response &&
          (imageDataSrc || onlyText ? (
            <div className="flex flex-col items-center space-y-4 p-6">
              {onlyText && (
                <p className="px-4 py-3 font-semibold text-white">{response}</p>
              )}
              {imageDataSrc && (
                <img
                  src={imageDataSrc}
                  alt="Gemini Image"
                  width={500}
                  height={300}
                  className="rounded-md shadow-md"
                  // priority={true}
                  // placeholder="blur"
                  // blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R/HNlm+3YZ"
                />
              )}
            </div>
          ) : (
            <Textarea
              value={response}
              readOnly
              placeholder="Your response...."
              className="w-full border border-gray-100 bg-neutral-950 px-6 py-3 font-semibold text-white"
            />
          ))}
      </div>
    </div>
  );
}
