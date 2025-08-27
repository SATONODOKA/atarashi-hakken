import { NextResponse } from "next/server";

const SCRAPER_ENDPOINT = "http://localhost:8080/scrape";
const TOPIC_URLS = [
  "https://zenn.dev/topics/%E7%94%9F%E6%88%90ai",
  "https://zenn.dev/topics/llm", 
  "https://zenn.dev/topics/ai",
];

export async function GET() {
  try {
    const all: any[] = [];
    
    for (const url of TOPIC_URLS) {
      console.log(`Scraping: ${url}`);
      
      const response = await fetch(SCRAPER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topicUrl: url, 
          pages: 1,
          delayMs: 500
        }),
      });
      
      if (!response.ok) {
        console.error(`Failed to scrape ${url}: ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      if (data.success && data.items) {
        all.push(...data.items);
      }
    }
    
    // 重複URL除去
    const map = new Map<string, any>();
    for (const item of all) {
      if (!map.has(item.url)) {
        map.set(item.url, {
          id: item.url.split('/').pop() || Math.random().toString(),
          url: item.url,
          title: item.title,
          summary: item.summary,
          publishedAt: item.publishedAt
        });
      }
    }
    
    // 投稿日順でソート
    const articles = [...map.values()].sort((a, b) =>
      String(b.publishedAt || "").localeCompare(String(a.publishedAt || ""))
    );
    
    console.log(`Total unique articles: ${articles.length}`);
    
    return NextResponse.json({ 
      success: true,
      articles: articles.slice(0, 20) // 最大20件
    });
    
  } catch (error: any) {
    console.error("Crawl error:", error);
    return NextResponse.json({ 
      error: error?.message || "crawl failed",
      success: false,
      articles: []
    }, { status: 500 });
  }
}