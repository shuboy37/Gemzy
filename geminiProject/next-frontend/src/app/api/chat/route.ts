import { streamText, UIMessage, convertToModelMessages } from "ai";
import { openrouter } from "@/lib/utils/openrouter";
import { chatRequestSchema, ChatAttachment } from "@/lib/api-types";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Fetch presigned URL for an S3 file (fallback if frontend didn't provide one)
 */
async function getPresignedUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME as string,
    Key: fileKey,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Fetch document content from S3 and extract text
 * For PDFs and DOCX, we need to process them differently
 * @param fileKey - S3 file key
 * @param type - Document type (pdf, docx, txt)
 * @param documentUrl - Optional presigned URL from frontend (avoids regenerating)
 */
async function fetchDocumentContent(
  fileKey: string,
  type: string,
  documentUrl?: string
): Promise<string> {
  try {
    // Use the URL from frontend if available, otherwise generate a new one
    const url = documentUrl || (await getPresignedUrl(fileKey));
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    // For text files, just read as text
    if (type === "txt") {
      return await response.text();
    }

    // For PDF and DOCX, we'll include them as file references
    // The AI model will receive the URL and can process it
    // Note: Some models support PDF natively (Gemini, Claude)
    return `[Document: ${fileKey}]`;
  } catch (error) {
    console.error(`Error fetching document ${fileKey}:`, error);
    return `[Error loading document: ${fileKey}]`;
  }
}

/**
 * Build system prompt with document context
 */
function buildSystemPromptWithDocuments(
  documentContents: Array<{ title: string; content: string }>
): string | undefined {
  if (documentContents.length === 0) return undefined;

  const docContext = documentContents
    .map((doc) => `--- Document: ${doc.title} ---\n${doc.content}`)
    .join("\n\n");

  return `You have access to the following documents that the user has uploaded:\n\n${docContext}\n\nUse this information to help answer the user's questions.`;
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

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
        ["pdf", "docx", "txt"].includes(a.type)
      );

      // Process documents - extract text content
      if (documentAttachments.length > 0) {
        const documentContents = await Promise.all(
          documentAttachments.map(async (doc) => ({
            title: doc.title,
            // Use documentUrl from frontend if available (from useGetS3AttachmentUrl)
            content: await fetchDocumentContent(
              doc.fileKey,
              doc.type,
              "documentUrl" in doc ? doc.documentUrl : undefined
            ),
          }))
        );
        systemPrompt = buildSystemPromptWithDocuments(documentContents);
      }

      // Process images - add to the last user message
      if (imageAttachments.length > 0) {
        const lastMessageIndex = processedMessages.length - 1;
        const lastMessage = processedMessages[lastMessageIndex];

        if (lastMessage.role === "user") {
          // Get presigned URLs for images
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

          // Add images to the last user message parts
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
