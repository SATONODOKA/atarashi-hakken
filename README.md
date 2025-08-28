# 週次AIニュース候補ツール

経営層向けの週次AIニュース候補を素早く作成するためのWebアプリケーション

## 🚀 デモ

https://classy-dango-86b693.netlify.app

## 📋 機能

- Gemini APIを使用した最新AIニュースの自動取得（直近7日間）
- HRビジネスへの示唆を含む要約
- 複数選択可能なチェックボックス付きリスト表示
- レスポンシブデザイン

## 🛠 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Google Generative AI (Gemini API)
- Netlify

## 📦 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/SATONODOKA/atarashi-hakken.git
cd atarashi-hakken
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、Gemini APIキーを設定：

```bash
GEMINI_API_KEY=your_api_key_here
```

APIキーの取得方法：
1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. 新しいAPIキーを作成
3. キーをコピーして上記の環境変数に設定

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 🌐 Netlifyへのデプロイ

### 環境変数の設定（重要）

Netlifyにデプロイする際は、必ず以下の環境変数を設定してください：

1. Netlify管理画面にログイン
2. サイトの設定画面へ移動
3. `Site configuration` → `Environment variables` を選択
4. `Add a variable` をクリック
5. 以下を入力：
   - Key: `GEMINI_API_KEY`
   - Value: `your_api_key_here`
6. `Add` をクリックして保存

### デプロイ手順

1. GitHubリポジトリをNetlifyに接続
2. ブランチ: `new` を選択
3. ビルド設定は自動検出（netlify.tomlから読み込み）
4. デプロイ開始

## 📝 使い方

1. 「ニュース取得（Gemini）」ボタンをクリック
2. 取得されたニュース一覧から必要な項目を選択
3. 「GO（選択を週報へ）」ボタンで選択内容を確認

## 🔧 トラブルシューティング

### "APIエラーのため、モックデータを表示中" が表示される場合

- **ローカル環境**: `.env.local` ファイルにGEMINI_API_KEYが正しく設定されているか確認
- **Netlify**: 環境変数 `GEMINI_API_KEY` が設定されているか確認
- APIキーが有効であることを確認

### 環境変数が認識されない場合

1. Netlifyの環境変数設定を確認
2. デプロイを再実行
3. ビルドログでエラーメッセージを確認

## 🚧 今後の実装予定

- [ ] Firestore連携（データ永続化）
- [ ] Google Docs自動出力
- [ ] HackerNews/Grok連携
- [ ] 重複記事の自動排除
- [ ] スコアリング機能

## 📄 ライセンス

MIT