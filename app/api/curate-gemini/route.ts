import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CurationResponse } from '@/shared/types';

export const runtime = "nodejs";

// デバッグ用：環境変数の確認
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');

export async function GET() {
  // 環境変数チェックとデバッグ情報
  console.log('Environment check:', {
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length,
    keyPrefix: apiKey?.substring(0, 10),
    nodeEnv: process.env.NODE_ENV
  });

  if (!apiKey) {
    console.error('API Key not found - returning mock data');
    const mockItems: CurationResponse = {
      items: [
        {
          id: crypto.randomUUID(),
          title: "環境変数が設定されていません",
          summary: "NetlifyでGEMINI_API_KEY環境変数を設定してください。Site settings → Environment variablesから追加できます。",
          sourceUrl: "https://docs.netlify.com/environment-variables/overview/",
          origin: "gemini",
          sources: ["https://docs.netlify.com/environment-variables/overview/"],
          fetchedAt: new Date().toISOString(),
          whyItMatters: "API接続には環境変数の設定が必要です"
        }
      ]
    };
    return NextResponse.json(mockItems);
  }

  try {
    // より安定したモデルに変更
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
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
以下のサイトから直近7日間の「生成AI／LLM」関連の最新ニュースを5-8件選んで要約してください：

参考サイト: ${MUST_SITES.join(", ")}, techcrunch.com, theverge.com, arstechnica.com

[出力形式（JSON配列のみ）]
[
  {
    "title": "実際のニュースタイトル",
    "summary": "140字以内の日本語要約",
    "sources": ["https://実際のURL"],
    "publishedAt": "実際の公開日時（ISO形式）",
    "whyItMatters": "HRビジネスへの示唆を1行で"
  }
]

[重要な条件]
- 実在するニュースのみ使用（架空のニュースは禁止）
- URLは実在するもののみ
- 期間: ${sinceISO} 以降（直近7日）
- 技術的な重要度が高いものを優先
- 重複は避ける

`.trim();

    // 一時的にWeb検索なしで動作（レート制限回避）
    // TODO: レート制限解除後にGrounding（Web検索）を再有効化
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
    console.error('Gemini API error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      apiKeyLength: apiKey?.length,
      timestamp: new Date().toISOString()
    });
    
    // フォールバック：より詳細なエラー情報付きモックデータ
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const mockItems: CurationResponse = {
      items: [
        {
          id: crypto.randomUUID(),
          title: "APIエラー: " + errorMessage,
          summary: `Gemini APIエラー: ${errorMessage}。環境変数の確認、APIキーの有効性、モデル名の正確性をチェックしてください。`,
          sourceUrl: "https://ai.google.dev/gemini-api/docs",
          origin: "gemini",
          sources: ["https://ai.google.dev/gemini-api/docs"],
          fetchedAt: new Date().toISOString(),
          whyItMatters: "API接続の詳細調査が必要です"
        }
      ]
    };
    
    return NextResponse.json(mockItems);
  }
}