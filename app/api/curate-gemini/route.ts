import { NextResponse } from 'next/server';
import type { CurationResponse } from '@/shared/types';

export async function GET() {
  const mockItems: CurationResponse = {
    items: [
      {
        id: "uuid-001",
        title: "Anthropic、ブラウザAIアシスタント「Claude Code」を発表",
        summary: "Chrome拡張として動作するAIがページ内容を理解し、要約や操作補助を提供。エンジニア向け機能も充実。",
        sourceUrl: "https://example.com/anthropic-browser-assistant",
        origin: "gemini",
        sources: ["https://example.com/anthropic-browser-assistant"],
        publishedAt: "2025-08-26T09:00:00.000Z",
        fetchedAt: new Date().toISOString()
      },
      {
        id: "uuid-002",
        title: "OpenAIとAnthropic、安全性評価の結果を共同公開",
        summary: "主要モデルの安全性評価を共同で実施し、透明性向上を目指す取り組み。業界標準化への第一歩。",
        sourceUrl: "https://example.com/openai-anthropic-safety",
        origin: "gemini",
        sources: ["https://example.com/openai-anthropic-safety", "https://example.com/safety-review"],
        publishedAt: "2025-08-25T14:30:00.000Z",
        fetchedAt: new Date().toISOString()
      },
      {
        id: "uuid-003",
        title: "Google、Gemini 2.0をエンタープライズ向けに最適化",
        summary: "企業向けGeminiモデルが大幅改善。RAG機能強化とコスト削減を同時実現し、導入企業が急増中。",
        sourceUrl: "https://example.com/google-gemini-enterprise",
        origin: "gemini",
        sources: ["https://example.com/google-gemini-enterprise"],
        publishedAt: "2025-08-24T11:00:00.000Z",
        fetchedAt: new Date().toISOString()
      },
      {
        id: "uuid-004",
        title: "Microsoft、AI開発者向けの新プラットフォーム「Azure AI Studio」を発表",
        summary: "統合開発環境でモデルの訓練からデプロイまでを一元管理。OpenAI GPTとの連携も強化。",
        sourceUrl: "https://example.com/microsoft-azure-ai-studio",
        origin: "gemini",
        sources: ["https://example.com/microsoft-azure-ai-studio"],
        publishedAt: "2025-08-23T16:45:00.000Z",
        fetchedAt: new Date().toISOString()
      },
      {
        id: "uuid-005",
        title: "Meta、オープンソースLLM「Llama 4」の開発を発表",
        summary: "次世代Llamaは推論能力を大幅強化。オープンソースコミュニティとの協業で商用利用も拡大予定。",
        sourceUrl: "https://example.com/meta-llama-4",
        origin: "gemini",
        sources: ["https://example.com/meta-llama-4", "https://example.com/llama-roadmap"],
        publishedAt: "2025-08-22T10:15:00.000Z",
        fetchedAt: new Date().toISOString()
      }
    ]
  };

  // TODO: 実API接続（Gemini/Grok/HN）
  // TODO: Firestore保存（curations/YYYY-MM-DD/items/{id}）
  
  return NextResponse.json(mockItems);
}