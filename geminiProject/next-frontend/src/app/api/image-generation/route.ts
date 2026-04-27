import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatRequestSchema } from "@/lib/schemas/attachment.schema";
import { AIModel, getModelConfigByModel } from "@/lib/models";

export const maxDuration = 60;

const imageGenerationRequestSchema = chatRequestSchema.extend({
  prompt: z.string().optional().default(""),
  conversationHistory: z.array(z.any()).optional().default([]),
});

function getTextContent(message: any): string {
  if (!message) return "";

  if (typeof message.content === "string") {
    return message.content;
  }

  if (Array.isArray(message.parts)) {
    return message.parts
      .filter(
        (part: any): part is { type: "text"; text: string } =>
          part?.type === "text" && typeof part.text === "string"
      )
      .map((part: { type: "text"; text: string }) => part.text)
      .join("");
  }

  return "";
}

function getGeneratedImageUrl(message: any): string | undefined {
  return message?.metadata?.generatedImageUrl || message?.imgurl;
}

function isLikelyImageEditRequest(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase();

  return [
    "make it",
    "make the",
    "change",
    "modify",
    "edit",
    "variation",
    "variant",
    "turn it",
    "turn the",
    "add",
    "remove",
    "replace",
    "style",
    "background",
    "color",
    "red",
    "blue",
    "green",
    "anime",
    "cinematic",
  ].some((keyword) => lowerPrompt.includes(keyword));
}

function resolveImageModel(model: string): { modelId: string; isImageGeneration: boolean } {
  const config = getModelConfigByModel(model as AIModel);
  if (config.isImageGeneration) {
    return { modelId: config.modelId, isImageGeneration: true };
  }

  const normalized = model.trim().toLowerCase();

  if (
    normalized.includes("gpt-5-image") ||
    normalized.includes("flash-image") ||
    normalized.includes("image-preview") ||
    normalized.includes("nano banana")
  ) {
    return { modelId: model, isImageGeneration: true };
  }

  return { modelId: config.modelId, isImageGeneration: false };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, model, attachments, conversationHistory } =
      imageGenerationRequestSchema.parse(body);

    const resolvedModel = resolveImageModel(model);

    if (!resolvedModel.isImageGeneration) {
      return NextResponse.json(
        { error: `Selected model does not support image generation: ${model}` },
        { status: 400 }
      );
    }

    const imageAttachments = (attachments || []).filter(
      (attachment) => attachment.type === "image" && "url" in attachment
    );

    if (!prompt.trim() && imageAttachments.length === 0) {
      return NextResponse.json(
        { error: "Prompt or reference image is required." },
        { status: 400 }
      );
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const trimmedPrompt = prompt.trim();
    const messages: Array<Record<string, unknown>> = [];

    const recentTextHistory = (conversationHistory || [])
      .filter((message: any) => message?.role === "user")
      .map((message: any) => getTextContent(message))
      .filter(Boolean)
      .slice(-3);

    for (const historicalPrompt of recentTextHistory) {
      messages.push({
        role: "user",
        content: historicalPrompt,
      });
    }

    const recentGeneratedImage = [...(conversationHistory || [])]
      .reverse()
      .map((message: any) => getGeneratedImageUrl(message))
      .find(Boolean);

    if (
      recentGeneratedImage &&
      imageAttachments.length === 0 &&
      isLikelyImageEditRequest(trimmedPrompt)
    ) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Modify this image:" },
          {
            type: "image_url",
            image_url: { url: recentGeneratedImage },
          },
        ],
      });
    }

    const currentPromptParts: Array<Record<string, unknown>> = [
      {
        type: "text",
        text:
          trimmedPrompt ||
          "Generate an image based on the provided reference image.",
      },
    ];

    for (const attachment of imageAttachments) {
      currentPromptParts.push({
        type: "image_url",
        image_url: { url: attachment.url },
      });
    }

    messages.push({
      role: "user",
      content:
        currentPromptParts.length === 1 &&
        typeof currentPromptParts[0]?.text === "string"
          ? currentPromptParts[0].text
          : currentPromptParts,
    });

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openrouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Gemzy",
        },
        body: JSON.stringify({
          model: resolvedModel.modelId,
          messages,
          modalities: ["image", "text"],
        }),
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        result?.error?.message ||
        result?.message ||
        `OpenRouter image generation failed with ${response.status}`;

      return NextResponse.json({ error: message, details: result }, { status: response.status });
    }

    const responseMessage = result?.choices?.[0]?.message;

    let imageUrl: string | undefined;
    if (responseMessage?.images?.[0]?.image_url?.url) {
      imageUrl = responseMessage.images[0].image_url.url;
    } else if (responseMessage?.images?.[0]?.url) {
      imageUrl = responseMessage.images[0].url;
    } else if (Array.isArray(responseMessage?.content)) {
      const imagePart = responseMessage.content.find(
        (part: any) => part?.type === "image_url" && part?.image_url?.url
      );
      imageUrl = imagePart?.image_url?.url;
    }

    let responseText = "";
    if (typeof responseMessage?.content === "string") {
      responseText = responseMessage.content;
    } else if (Array.isArray(responseMessage?.content)) {
      responseText = responseMessage.content
        .filter(
          (part: any): part is { type: "text"; text: string } =>
            part?.type === "text" && typeof part.text === "string"
        )
        .map((part: { type: "text"; text: string }) => part.text)
        .join("\n");
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      text: responseText || "Here's your generated image.",
      model: resolvedModel.modelId,
      prompt: trimmedPrompt,
      raw: result,
    });
  } catch (error) {
    console.error("[/api/image-generation] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid image generation request.", details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
