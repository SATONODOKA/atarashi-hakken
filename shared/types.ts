export type CuratedItem = {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  origin: "gemini" | "hn" | "grok";
  sources?: string[];
  publishedAt?: string;
  fetchedAt: string;
};

export type CurationResponse = {
  items: CuratedItem[];
};