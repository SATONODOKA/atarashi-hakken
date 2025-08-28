import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CurationResponse } from '@/shared/types';

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');

export async function GET() {
  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" });
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    // Web検索なしでテスト（軽量）
    const prompt = `現在話題のAI関連ニュースを3件、以下の形式で返してください：

[
  {
    "title": "ニュースタイトル",
    "summary": "100字程度の要約",
    "sources": ["https://実在のURL"],
    "publishedAt": "2024-01-01T12:00:00Z",
    "whyItMatters": "ビジネスへの影響"
  }
]`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    const responseText = result.response.text();
    let items = JSON.parse(responseText);

    const processedItems = items.map((item: any) => ({
      id: crypto.randomUUID(),
      title: item.title,
      summary: item.summary,
      sourceUrl: item.sources?.[0] || "https://example.com",
      sources: item.sources || [],
      publishedAt: item.publishedAt,
      whyItMatters: item.whyItMatters,
      origin: "gemini" as const,
      fetchedAt: new Date().toISOString()
    }));

    return NextResponse.json({ items: processedItems } as CurationResponse);
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}