import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStream,
  createIdGenerator,
  createUIMessageStreamResponse,
} from "ai";
import { openrouter } from "@/lib/utils/openrouter";
import { ChatAttachment} from "@/lib/api-types";
import { chatRequestSchema } from "@/lib/schemas/attachment.schema";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type MetaData = {
  attachments?: ChatAttachment[];
  userMessage?: string;
};

type MyUIMessage = UIMessage<MetaData>;

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
    const mammoth = await import("mammoth");
    const url = documentUrl ?? (await getPresignedUrl(fileKey));

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
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
    console.log("74", messages);
    console.log("75", messages[0].parts);

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

    const lastUserMessageIndex = messages.length - 1;
    console.log(lastUserMessageIndex);
    const lastUserMessage = messages[lastUserMessageIndex];
    console.log(lastUserMessage);

    const textPart = lastUserMessage.parts.find(
      (part): part is { type: "text"; text: string } => part.type === "text"
    );
    const userText = textPart?.text || "";

    const userMessage: MyUIMessage = {
      id: createIdGenerator({ prefix: "msg", size: 16 })(),
      role: "user",
      parts: [{ type: "text", text: userText }],
      metadata: {
        attachments: attachments || [],
        userMessage: userText,
      },
    };

    console.log("110", userMessage);

    console.log("[/api/chat] Using model:", model);

    // 4. Process attachments if any
    let systemPrompt: string | undefined;
    // const processedMessages = [...messages];

    if (attachments && attachments.length > 0) {
      const imageAttachments = attachments.filter((a) => a.type === "image");
      const documentAttachments = attachments.filter((a) =>
        ["pdf", "txt"].includes(a.type)
      );
      const docxAttachments = attachments.filter((a) => a.type === "docx");

      if (docxAttachments.length > 0) {
        const documentContents = await Promise.all(
          docxAttachments.map(async (docx) => ({
            title: docx.title,
            content: await fetchDocxContent(
              docx.fileKey,
              "url" in docx ? docx.url : undefined
            ),
          }))
        );
        systemPrompt = buildSystemPromptWithDocuments(documentContents);
      }

      // const lastMessageIndex = processedMessages.length - 1;
      // const lastMessage = processedMessages[lastMessageIndex];

      if (lastUserMessage.role === "user") {
        if (imageAttachments.length > 0) {
          const imageUrls = await Promise.all(
            imageAttachments.map(async (img) => {
              const url =
                "url" in img && img.url
                  ? img.url
                  : await getPresignedUrl(img.fileKey);
              return {
                type: "image" as const,
                image: url,
              };
            })
          );
          userMessage.parts = [
            ...userMessage.parts,
            ...imageUrls.map((img) => ({
              type: "file" as const,
              mediaType: "image/png",
              url: img.image,
            })),
          ];
        }

        if (documentAttachments.length > 0) {
          const documentUrls = await Promise.all(
            documentAttachments.map(async (doc) => {
              const docUrl =
                "url" in doc && doc.url
                  ? doc.url
                  : await getPresignedUrl(doc.fileKey);
              return {
                type: "document" as const,
                document: docUrl,
              };
            })
          );
          userMessage.parts = [
            ...userMessage.parts,
            ...documentUrls.map((doc) => ({
              type: "file" as const,
              mediaType: "application/pdf",
              url: doc.document,
            })),
          ];
        }
      }
    }
    console.log("190", userMessage);
    const convoHistory: MyUIMessage[] = messages.slice(0, -1).map((msg) => {
      if (msg.role === "assistant") {
        return msg as MyUIMessage;
      }
      return {
        ...msg,
        metadata: msg.metadata || {
          attachments: [],
          userMessage: msg.parts.find(
            (part): part is { type: "text"; text: string } =>
              part.type === "text"
          )?.text,
        },
      };
    });
    console.log("206", convoHistory);

    const finalMessages: MyUIMessage[] =
      messages.length > 1 ? [...convoHistory, userMessage] : [userMessage];

    console.log(
      "211 📤 Sending to stream - finalMessages:",
      JSON.stringify(finalMessages, null, 2)
    );

    const stream = createUIMessageStream<MyUIMessage>({
      originalMessages: finalMessages,
      generateId: createIdGenerator({ prefix: "msg", size: 16 }),
      execute: async ({ writer }) => {
        const result = streamText({
          model: openrouter.chat(model),
          system: systemPrompt,
          messages: convertToModelMessages(finalMessages),
        });
        writer.merge(result.toUIMessageStream());
      },
    });

    // 5. Stream text using OpenRouter
    // const result = streamText({
    //   model: openrouter.chat(model),
    //   system: systemPrompt,
    //   messages: convertToModelMessages(processedMessages),
    // });

    // 6. Return streaming response (AI SDK protocol)
    return createUIMessageStreamResponse({ stream });
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
