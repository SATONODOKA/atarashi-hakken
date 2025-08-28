import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CurationResponse } from '@/shared/types';

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp" 
    });

    // 直近7日（UTC基準）
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sinceISO = sevenDaysAgo.toISOString();

    const MUST_SITES = [
      "news.ycombinator.com",
      "reddit.com/r/MachineLearning",
      "reddit.com/r/LocalLLaMA",
      "openai.com", "anthropic.com", "deepmind.google",
      "ai.facebook.com", "huggingface.co",
      "benbbites.com", "tldr.tech"
    ];

    const prompt = `
あなたは調査担当です。経営層の議論材料として、直近7日間に公開された
「生成AI／LLM」関連ニュースから **技術寄り**の重要トピックを10件選び、
**HRビジネスに示唆があるものを優先**して要約してください。

[前提]
- 期間: ${sinceISO} 以降（直近7日）
- 重点: 技術的インパクト（モデル/推論基盤/価格/評価/オープンソース/規制Tech）を重視
- HR文脈: 採用/育成/評価/配置/生産性/ナレッジ/法務・労務への影響を簡潔に触れる
- 出典: 一次情報または信頼媒体の実在URL必須（推測や死活不明URLは不可）
- 参考サイト（必ず確認を試みる）: ${MUST_SITES.join(", ")}
- 類似テーマは代表1件に統合し、重複を避ける

[出力形式（JSON配列のみ、最大10件）]
各要素:
{
  "title": "見出し（原語可）",
  "summary": "事実のみの日本語要約（140字以内）",
  "sources": ["https://...","https://..."],
  "publishedAt": "YYYY-MM-DDTHH:mm:ssZ",
  "whyItMatters": "経営/HRにとっての示唆を1行（断定は避け簡潔に）"
}
`.trim();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    // JSONパース & 正規化
    let raw: any[] = [];
    try { 
      const responseText = result.response.text();
      raw = JSON.parse(responseText); 
    } catch (error) { 
      console.error('JSON parse error:', error);
      raw = []; 
    }

    const items = (raw || [])
      .filter((x: any) => x?.title && Array.isArray(x?.sources) && x.sources[0])
      .slice(0, 10)
      .map((x: any) => ({
        id: crypto.randomUUID(),
        title: String(x.title).trim(),
        summary: String(x.summary || "").trim(),
        sourceUrl: String(x.sources[0]),
        sources: x.sources,
        publishedAt: x.publishedAt || undefined,
        whyItMatters: String(x.whyItMatters || "").trim(),
        origin: "gemini" as const,
        fetchedAt: new Date().toISOString()
      }));

    return NextResponse.json({ items } as CurationResponse);
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // フォールバック：モックデータ
    const mockItems: CurationResponse = {
      items: [
        {
          id: crypto.randomUUID(),
          title: "APIエラーのため、モックデータを表示中",
          summary: "Gemini APIへの接続に失敗しました。実際のニュースは取得できませんでした。",
          sourceUrl: "https://example.com",
          origin: "gemini",
          sources: ["https://example.com"],
          fetchedAt: new Date().toISOString(),
          whyItMatters: "API接続の確認が必要です"
        }
      ]
    };
    
    return NextResponse.json(mockItems);
  }
}