import { getGroqChatCompletion } from "@/lib/services/groqServices";

export const handleGroq = async (
  input: string,
  effectiveModel: string
): Promise<ReadableStream> => {
  try {
    const groqStream = await getGroqChatCompletion({ input, effectiveModel });
    console.log(groqStream);
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of groqStream) {
            console.log(chunk);
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              const jsonChunk =
                JSON.stringify({ type: "delta", content: delta }) + "\n";
              console.log(jsonChunk);
              controller.enqueue(new TextEncoder().encode(jsonChunk));
            }
          }

          const metaChunk =
            JSON.stringify({ type: "meta", model: effectiveModel }) + "\n";
          controller.enqueue(new TextEncoder().encode(metaChunk));
          controller.close();
        } catch (error) {
          console.error("Error processing Groq stream:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Stream processing error";
          const jsonError =
            JSON.stringify({ type: "error", message: errorMessage }) + "\n";
          controller.enqueue(new TextEncoder().encode(jsonError));
          controller.close();
        }
      },
    });
  } catch (error: unknown) {
    console.error("Error in handleGroq:", error);
    return new ReadableStream({
      start(controller) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        const jsonError =
          JSON.stringify({ type: "error", message: errorMessage }) + "\n";
        controller.enqueue(new TextEncoder().encode(jsonError));
        controller.close();
      },
    });
  }
};
