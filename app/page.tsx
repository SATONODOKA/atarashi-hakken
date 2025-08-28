'use client';

import { useState } from 'react';
import type { CuratedItem } from '@/shared/types';

export default function HomePage() {
  const [items, setItems] = useState<CuratedItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/curate-gemini');
      const data = await response.json();
      setItems(data.items);
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to fetch news:', error);
      alert('ニュースの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleGoToWeekly = () => {
    const selectedCount = selectedIds.size;
    alert(`選択されたニュース: ${selectedCount}件`);
    // TODO: GO→Google Docsへ書き出し
  };

  const getOriginIcon = (origin: string) => {
    switch (origin) {
      case 'gemini':
        return '🅖';
      case 'hn':
        return '🅗'; // TODO: origin: "hn"のアイコン差替え
      case 'grok':
        return 'Ⓧ'; // TODO: origin: "grok"のアイコン差替え
      default:
        return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <button
            onClick={fetchNews}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? '取得中...' : 'ニュース取得（Gemini）'}
          </button>
          
          <button
            onClick={handleGoToWeekly}
            disabled={selectedIds.size === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            GO（選択を週報へ）{selectedIds.size > 0 && ` - ${selectedIds.size}件`}
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            ニュースを取得するには上のボタンをクリックしてください
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xl" title={`Source: ${item.origin}`}>
                        {getOriginIcon(item.origin)}
                      </span>
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline flex-1"
                      >
                        {item.title}
                      </a>
                    </div>
                    
                    <p className="text-gray-700 mb-2 line-clamp-2">
                      {item.summary}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {new URL(item.sourceUrl).hostname}
                      </span>
                      {item.publishedAt && (
                        <span>
                          公開: {formatDate(item.publishedAt)}
                        </span>
                      )}
                      <span>
                        取得: {formatDate(item.fetchedAt)}
                      </span>
                    </div>
                    
                    {item.sources && item.sources.length > 1 && (
                      <div className="mt-2 text-xs text-gray-400">
                        他 {item.sources.length - 1} 件の関連ソース
                      </div>
                    )}
                    
                    {item.whyItMatters && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                        💡 {item.whyItMatters}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}