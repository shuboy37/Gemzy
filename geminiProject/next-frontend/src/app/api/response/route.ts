import { NextRequest, NextResponse } from "next/server";
import { handleGemini } from "@/lib/controllers/gemini.controller";
import { handleGroq } from "@/lib/controllers/handleGroq";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const model = formData.get("model") as string;
    const input = formData.get("input") as string;
    const files = formData.getAll("files") as File[];

    console.log(`[API Route] Received request for model: ${model}`);
    console.log(`[API Route] Input: "${input}"`);
    console.log(`[API Route] Files count: ${files.length}`);

    let effectiveModel = model;

    const pdfRegex =
      /(?:https?:\/\/)?(?:www\.)?[\w-]+(?:\.[\w.-]+)+(?:\/[\w\-./?%&=]*)?\.pdf/gi;
    const hasPdfMatches = pdfRegex.test(input);

    if (hasPdfMatches && !model.startsWith("gemini")) {
      effectiveModel = "gemini-2.0-flash";
      console.log(
        `[API Route] PDF URL detected with incompatible model '${model}'. Switched to '${effectiveModel}'.`
      );
    }
    if (files.length > 0 && model !== "gemini-2.0-flash-exp-image-generation") {
      effectiveModel = "gemini-2.0-flash-exp-image-generation";
      console.log(
        `[API Route] Image generation detected with incompatible model '${model}'. Switched to '${effectiveModel}'.`
      );
    }

    let stream: ReadableStream;

    if (effectiveModel.startsWith("llama")) {
      console.log("[API Route] Handing off to Groq handler.");
      stream = await handleGroq(input, effectiveModel);
    } else {
      console.log("[API Route] Handing off to Gemini handler.");
      stream = handleGemini(input, effectiveModel, files);
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
