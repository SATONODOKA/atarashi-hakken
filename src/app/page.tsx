"use client";

import { useState } from "react";

type Article = {
  id: string;
  title: string;
  url: string;
  summary?: string;
  publishedAt?: string;
};

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/crawl");
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          生成AIニュース収集ツール
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Zennから最新の生成AI関連記事を取得します
        </p>
      </header>

      <div className="mb-8">
        <button
          onClick={fetchArticles}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {loading ? "取得中..." : "Zenn最新を取得"}
        </button>
      </div>

      <div className="space-y-4">
        {articles.length === 0 && !loading && (
          <p className="text-gray-500 dark:text-gray-400">
            記事を取得するにはボタンを押してください
          </p>
        )}

        {articles.map((article) => (
          <div
            key={article.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
          >
            <h2 className="text-lg font-semibold mb-2">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {article.title}
              </a>
            </h2>
            {article.publishedAt && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                投稿日: {article.publishedAt}
              </p>
            )}
            {article.summary && (
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {article.summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
