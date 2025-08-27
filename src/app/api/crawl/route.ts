import { NextResponse } from "next/server";

const mockArticles = [
  {
    id: "1",
    title: "ChatGPTと生成AIの最新動向について",
    url: "https://zenn.dev/example1",
    summary: "生成AI技術の進歩と企業での活用事例について解説します。",
    publishedAt: "2025-08-26"
  },
  {
    id: "2", 
    title: "LLMを活用したアプリケーション開発入門",
    url: "https://zenn.dev/example2",
    summary: "大規模言語モデルを使ったWebアプリケーションの構築方法を紹介。",
    publishedAt: "2025-08-25"
  },
  {
    id: "3",
    title: "AIによるコード生成ツールの比較と選び方",
    url: "https://zenn.dev/example3", 
    summary: "GitHub Copilot、Claude Code、Cursor等のAIツールを比較検討。",
    publishedAt: "2025-08-24"
  },
  {
    id: "4",
    title: "プロンプトエンジニアリングのベストプラクティス",
    url: "https://zenn.dev/example4",
    summary: "効果的なプロンプト設計の手法と実践的なテクニックを解説。",
    publishedAt: "2025-08-23"
  },
  {
    id: "5",
    title: "RAGシステムの構築と運用ノウハウ",
    url: "https://zenn.dev/example5",
    summary: "Retrieval-Augmented Generationの実装と最適化について。",
    publishedAt: "2025-08-22"
  }
];

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return NextResponse.json({
    articles: mockArticles
  });
}