import express from "express";
import cors from "cors";
import { chromium } from "playwright";

const app = express();
app.use(cors());
app.use(express.json());

type Item = {
  url: string;
  title: string;
  summary?: string;
  publishedAt?: string;
};

async function scrapeTopic(topicUrl: string, pages = 1, delayMs = 800): Promise<Item[]> {
  const browser = await chromium.launch({ 
    headless: true, 
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] 
  });
  
  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  
  const page = await ctx.newPage();
  const out: Item[] = [];
  let url = topicUrl;

  for (let i = 0; i < pages; i++) {
    console.log(`Scraping page ${i + 1}: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);

      // デバッグ: ページの構造を確認
      const debugInfo = await page.evaluate(() => {
        const articleLinks = document.querySelectorAll('a[href*="/articles/"]');
        const allLinks = document.querySelectorAll('a');
        return {
          articleLinksCount: articleLinks.length,
          totalLinksCount: allLinks.length,
          sampleLinks: Array.from(allLinks).slice(0, 5).map(a => ({
            href: a.getAttribute('href'),
            text: a.textContent?.trim().substring(0, 50)
          }))
        };
      });
      
      console.log('Debug info:', debugInfo);

      // 記事情報を一括で取得 (より広いセレクタを使用)
      const items: Item[] = await page.evaluate(() => {
        const articles: Item[] = [];
        const seenUrls = new Set<string>();

        // より広範囲で記事リンクを探す
        const links = document.querySelectorAll('a[href*="/articles/"], a[href*="zenn.dev/articles/"]');
        
        links.forEach((link) => {
          const href = link.getAttribute("href");
          if (!href) return;
          
          // URLを正規化
          let normalizedUrl = href;
          if (href.startsWith('/')) {
            normalizedUrl = new URL(href, location.origin).toString();
          }
          
          if (seenUrls.has(normalizedUrl)) return;
          seenUrls.add(normalizedUrl);

          // 親要素を探す (Zennの構造に特化)
          let container = link.closest('article') || 
                         link.closest('[class*="card"]') ||
                         link.closest('li') ||
                         link.closest('div');

          // タイトルを取得 (Zennの構造に特化)
          let title = "";
          
          // 様々な方法でタイトルを探す
          const titleSelectors = [
            'h2', 'h3', 'h1',
            '[class*="title"]',
            'p',
            'span'
          ];
          
          for (const selector of titleSelectors) {
            const el = container?.querySelector(selector);
            if (el) {
              const text = el.textContent?.trim() || "";
              // 有効なタイトルの条件
              if (text && 
                  text.length > 3 && 
                  text.length < 200 &&
                  !text.includes('投稿日') &&
                  !text.includes('更新日') &&
                  !/^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u.test(text)) {
                title = text;
                break;
              }
            }
          }
          
          // 最後の手段: リンクのテキスト
          if (!title) {
            const linkText = link.textContent?.trim() || "";
            if (linkText && linkText.length > 3) {
              title = linkText;
            }
          }

          // 要約を取得
          const summaryEl = container?.querySelector('p, div, span');
          const summary = summaryEl?.textContent?.trim() || "";

          // 投稿日を取得
          const timeEl = container?.querySelector('time, [datetime], [class*="date"]');
          const publishedAt = timeEl?.getAttribute("datetime") || 
                             timeEl?.textContent?.trim() || "";

          if (title && normalizedUrl && normalizedUrl.includes('/articles/')) {
            articles.push({
              url: normalizedUrl,
              title: title.length > 100 ? title.substring(0, 100) + '...' : title,
              summary: summary && summary.length > 200 ? summary.substring(0, 200) + '...' : summary || undefined,
              publishedAt: publishedAt || undefined,
            });
          }
        });

        return articles;
      });

      out.push(...items);
      console.log(`Extracted ${items.length} items from page ${i + 1}`);

      // 次ページを探す
      if (i < pages - 1) {
        const nextLink = await page.$('a[rel="next"], a:has-text("次のページへ"), a:has-text("次へ")') ||
                        await page.$('a[aria-label*="次"], a[title*="次"]');
        
        if (!nextLink) {
          console.log("No next page found");
          break;
        }

        const nextHref = await nextLink.getAttribute("href");
        if (!nextHref) {
          console.log("Next page has no href");
          break;
        }

        url = new URL(nextHref, "https://zenn.dev").toString();
        console.log(`Next page: ${url}`);
        await page.waitForTimeout(delayMs);
      }
    } catch (error) {
      console.error(`Error scraping page ${i + 1}:`, error);
      break;
    }
  }

  await browser.close();
  console.log(`Total items scraped: ${out.length}`);
  return out;
}

app.post("/scrape", async (req, res) => {
  try {
    const { topicUrl, pages = 1, delayMs = 800 } = req.body || {};
    
    if (!topicUrl) {
      return res.status(400).json({ error: "topicUrl required" });
    }

    console.log(`Starting scrape: ${topicUrl}, pages: ${pages}, delay: ${delayMs}ms`);
    const items = await scrapeTopic(topicUrl, pages, delayMs);
    
    res.json({ 
      success: true,
      count: items.length, 
      items: items.slice(0, 20) // 最大20件に制限
    });
  } catch (e: any) {
    console.error("Scrape error:", e);
    res.status(500).json({ 
      error: e?.message || "scrape failed",
      success: false
    });
  }
});

app.get("/healthz", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (_, res) => {
  res.json({ 
    name: "zenn-scraper", 
    version: "1.0.0",
    endpoints: ["/healthz", "POST /scrape"]
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Zenn scraper listening on port ${port}`);
});