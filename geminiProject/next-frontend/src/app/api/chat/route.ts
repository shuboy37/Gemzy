import {
  streamText,
  UIMessage,
  convertToModelMessages,
  systemModelMessageSchema,
} from "ai";
import { openrouter } from "@/lib/utils/openrouter";
import { chatRequestSchema } from "@/lib/api-types";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const maxDuration = 60;

async function getPresignedUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME as string,
    Key: fileKey,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

async function fetchDocxContent(
  fileKey: string,
  documentUrl?: string
): Promise<string> {
  try {
    // Use the URL from frontend if available, otherwise generate a new one
    const mammoth = await import("mammoth");
    const url = documentUrl ?? (await getPresignedUrl(fileKey));

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer(); // ← Need to await!
    const nodeBuffer = Buffer.from(buffer);
    const rawText = await mammoth.extractRawText({ buffer: nodeBuffer });
    return rawText.value;
  } catch (error) {
    console.error(`Error fetching document ${fileKey}:`, error);
    return `[Error loading document: ${fileKey}]`;
  }
}

function buildSystemPromptWithDocuments(
  documentContents: Array<{ title: string; content: string }>
): string | undefined {
  if (documentContents.length === 0) return undefined;

  const docContext = documentContents
    .map((doc) => `--- Document: ${doc.title} ---\n${doc.content}`)
    .join("\n\n");

  return `You have access to the following documents that the user has uploaded:\n\n${docContext}\n\nUse this information to help answer the user's questions.`;
}

export async function POST(req: Request) {
  try {
    // 1. Parse request body
    const body = await req.json();

    // 2. Extract messages (sent automatically by useChat)
    const messages: UIMessage[] = body.messages;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Validate custom body fields with Zod
    const { model, attachments } = chatRequestSchema.parse({
      model: body.model,
      attachments: body.attachments,
    });

    console.log("[/api/chat] Using model:", model);

    // 4. Process attachments if any
    let systemPrompt: string | undefined;
    const processedMessages = [...messages];

    if (attachments && attachments.length > 0) {
      // Separate images from documents
      const imageAttachments = attachments.filter((a) => a.type === "image");
      const documentAttachments = attachments.filter((a) =>
        ["pdf", "txt"].includes(a.type)
      );
      const docxAttachments = attachments.filter((a) => a.type === "docx");

      if (docxAttachments.length > 0) {
        const documentContents = await Promise.all(
          docxAttachments.map(async (docx) => ({
            title: docx.title,
            // Use documentUrl from frontend if available (from useGetS3AttachmentUrl)
            content: await fetchDocxContent(
              docx.fileKey,

              "documentUrl" in docx ? docx.documentUrl : undefined
            ),
          }))
        );
        systemPrompt = buildSystemPromptWithDocuments(documentContents);
      }

      const lastMessageIndex = processedMessages.length - 1;
      const lastMessage = processedMessages[lastMessageIndex];

      if (lastMessage.role === "user") {
        if (imageAttachments.length > 0) {
          const imageUrls = await Promise.all(
            imageAttachments.map(async (img) => {
              // Use the imageUrl if available, otherwise generate presigned URL
              const url =
                "imageUrl" in img && img.imageUrl
                  ? img.imageUrl
                  : await getPresignedUrl(img.fileKey);
              return {
                type: "image" as const,
                image: url,
              };
            })
          );
          const existingParts = lastMessage.parts || [];
          processedMessages[lastMessageIndex] = {
            ...lastMessage,
            parts: [
              ...existingParts,
              ...imageUrls.map((img) => ({
                type: "file" as const,
                mediaType: "image/png",
                url: img.image,
              })),
            ],
          };
        }

        if (documentAttachments.length > 0) {
          const documentUrls = await Promise.all(
            documentAttachments.map(async (doc) => {
              const docUrl =
                "documentUrl" in doc && doc.documentUrl
                  ? doc.documentUrl
                  : await getPresignedUrl(doc.fileKey);
              return {
                type: "document" as const,
                document: docUrl,
              };
            })
          );
          const existingParts = lastMessage.parts || [];
          processedMessages[lastMessageIndex] = {
            ...lastMessage,
            parts: [
              ...existingParts,
              ...documentUrls.map((doc) => ({
                type: "file" as const,
                mediaType: "application/pdf",
                url: doc.document,
              })),
            ],
          };
        }
      }
    }

    // 5. Stream text using OpenRouter
    const result = streamText({
      model: openrouter.chat(model),
      system: systemPrompt,
      messages: convertToModelMessages(processedMessages),
    });

    // 6. Return streaming response (AI SDK protocol)
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[/api/chat] Error:", error);

    // Handle Zod validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: error.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle other errors
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
