import { tavily } from "@tavily/core";

export type WebSearchResult = {
  title: string;
  url: string;
  content: string;
  score?: number;
};

export type WebSearchResponse = {
  query: string;
  results: WebSearchResult[];
  images: string[];
};

function getTavilyClient() {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not configured.");
  }

  return tavily({ apiKey });
}

export async function searchWeb(query: string): Promise<WebSearchResponse> {
  const client = getTavilyClient();
  const response: any = await client.search(query, {
    search_depth: "advanced",
    max_results: 8,
    include_answer: false,
    include_raw_content: false,
    include_images: true,
  });

  const results: WebSearchResult[] = (response?.results || [])
    .map((result: any) => ({
      title: typeof result?.title === "string" ? result.title : "Untitled",
      url: typeof result?.url === "string" ? result.url : "",
      content:
        typeof result?.content === "string"
          ? result.content
          : typeof result?.raw_content === "string"
            ? result.raw_content
            : "",
      score: typeof result?.score === "number" ? result.score : undefined,
    }))
    .filter((result: WebSearchResult) => result.url);

  const imageUrls = (response?.images || [])
    .map((image: any) => (typeof image === "string" ? image : image?.url))
    .filter(
      (url: unknown): url is string =>
        typeof url === "string" && /^https?:\/\//.test(url)
    );

  const images = Array.from(new Set<string>(imageUrls)).slice(0, 12);

  return {
    query,
    results,
    images,
  };
}
