import { NextRequest, NextResponse } from "next/server";
import { handleGemini } from "@/lib/controllers/gemini.controller";
import { handleGroq } from "@/lib/controllers/handleGroq";

export const dynamic = "force-dynamic";

function normalizeModelName(name: string | null | undefined): string {
  if (!name) return "";
  let s = String(name).trim().toLowerCase();

  // Replace spaces and underscores with hyphens
  s = s.replace(/[_\s]+/g, "-");

  // Replace anything that's not a-z, 0-9, dot or hyphen with a hyphen
  s = s.replace(/[^a-z0-9-.]+/g, "-");

  // Collapse repeated hyphens
  s = s.replace(/-+/g, "-");

  // Trim leading/trailing hyphens or dots
  s = s.replace(/^[.-]+|[.-]+$/g, "");

  return s;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const model = (formData.get("model") as string) || "";
    const input = formData.get("input") as string;
    const files = formData.getAll("files") as File[];

    const normalizedModel = normalizeModelName(model);

    console.log(
      `[API Route] Received request for model: ${model} (normalized: ${normalizedModel})`
    );
    console.log(`[API Route] Input: "${input}"`);
    console.log(`[API Route] Files count: ${files.length}`);

    // Use normalized slug form for routing/handler decisions. Fall back to raw model if empty.
    let effectiveModel = normalizedModel || model;
    let effectiveModelDisplayName = model; // Track display name separately

    const pdfRegex =
      /(?:https?:\/\/)?(?:www\.)?[\w-]+(?:\.[\w.-]+)+(?:\/[\w\-./?%&=]*)?\.pdf/gi;
    const hasPdfMatches = pdfRegex.test(input);

    if (hasPdfMatches && !normalizedModel.startsWith("gemini")) {
      effectiveModel = "gemini-2.5-flash";
      effectiveModelDisplayName = "Gemini 2.5 Flash"; // Set display name for fallback
      console.log(
        `[API Route] PDF URL detected with incompatible model '${model}'. Switched to '${effectiveModel}'.`
      );
    }
    if (
      files.length > 0 &&
      normalizedModel !== "gemini-2.0-flash-exp-image-generation"
    ) {
      effectiveModel = "gemini-2.0-flash-exp-image-generation";
      effectiveModelDisplayName = "Gemini Nano Banana"; // Set display name for image gen model
      console.log(
        `[API Route] Image generation detected with incompatible model '${model}'. Switched to '${effectiveModel}'.`
      );
    }

    let stream: ReadableStream;

    if (effectiveModel.startsWith("llama")) {
      console.log("[API Route] Handing off to Groq handler.");
      stream = await handleGroq(
        input,
        effectiveModel,
        effectiveModelDisplayName
      );
    } else {
      console.log("[API Route] Handing off to Gemini handler.");
      stream = handleGemini(
        input,
        effectiveModel,
        files,
        effectiveModelDisplayName
      );
      console.log(stream);
    }

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("[API Route] Critical Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred on the server.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
