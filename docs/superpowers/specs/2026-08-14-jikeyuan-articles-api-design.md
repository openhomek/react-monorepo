# jikeyuan 攻略文章服務設計（FastAPI + MongoDB）

- 日期：2026-08-14
- 狀態：已獲用戶口頭批准，待審閱
- 範圍：`apps/api`（新 FastAPI 服務）+ `apps/jikeyuan`（Guides 列表/詳情對接 API）

## 1. 背景與目標

jikeyuan（有解，OpenHomeK，`blog.openhomek.com`）目前的攻略內容 100% 寫死在前端 `src/content/guides.ts`（3 篇手寫攻略）。用戶另有一條離線爬蟲流水線（小紅書：xhs-downloader / MediaCrawler；全網：Crawl4AI），產出 markdown + 圖片。

目標：搭一個 FastAPI + MongoDB 後端服務，承接爬蟲產出的文章（含圖片），讓 jikeyuan 前端在**現有** `/guides` 列表頁與 `/guides/:slug` 詳情頁通過 API 渲染這些文章。

### 已確認的決策

| 決策點 | 結論 |
|---|---|
| 爬蟲 | 用戶自己離線跑，不在本服務範圍 |
| 匯入方式 | 走 API（方案 A）：skill 整理後一次 HTTP 請求完成驗證+傳圖+入庫 |
| 前端呈現 | 複用現有 Guides 列表 + `guides/:slug` 詳情路由，不新開板塊 |
| 部署 | 先全本機開發；架構保證之後可零改動上雲 |
| 圖片 | 對象存儲（R2/S3/OSS）為目標；本機開發用本地磁盤後端起步 |
| 文章結構 | 沿用現有 `Guide` 介面形狀，擴展 `GuideSection.images`；爬蟲來源資訊入 `origin` 欄位，展示走既有 `sources` |

### 明確排除（本階段不做）

- 爬蟲本身（含 Crawl4AI 整合、小紅書登入態）
- auth 後端（前端已有 auth 調用代碼，屬另一個服務）
- 生產環境實際部署、admin UI、sitemap/靜態 HTML 自動生成

## 2. 架構總覽

```
爬蟲（用戶離線跑）→ markdown + 圖片文件
        ↓ 用戶跑 Claude skill 整理成 Guide 形狀 JSON（圖片以 file:<名> 佔位）
        ↓ curl POST /api/admin/articles（multipart：JSON + 圖片）
FastAPI (:8000)  apps/api
        ├─ Pydantic 驗證 → 圖片上傳存儲後端（local / S3 兼容）→ 佔位符換成存儲鍵
        └─ MongoDB articles collection（按 slug upsert）
        ↓
jikeyuan 前端（列表頁合併顯示 / 詳情頁靜態查不到時調 API）
        GET /api/guides、GET /api/guides/{slug}（響應中存儲鍵已拼成完整 URL）
```

## 3. 資料模型

MongoDB `articles` collection。文件主體即前端 `Guide` 介面形狀，另加管理欄位：

```js
{
  // ==== Guide 介面既有欄位（前端渲染用）====
  slug: String,            // 唯一；^[a-z0-9-]+$
  category: String,        // 如「交通出行」
  title: String,
  cardTitle: String,
  description: String,
  publishedDate: String,   // YYYY-MM-DD
  reviewedDate: String,    // 可選
  readingTime: String,     // 可選，如「約 5 分鐘」
  imageAlt: String,        // 可選
  image: String,           // 可選；封面存儲鍵，如 articles/<slug>/cover.jpg
  featured: Boolean,       // 可選
  takeaways: [String],     // 可選
  sections: [{
    title: String,
    phase: String,          // 必填；任務軸標籤（現有頁面慣例）
    paragraphs: [String],   // 可選
    steps: [String],        // 可選
    table: { caption?, columns: [String], rows: [[String]] },  // 可選
    figures: [{ alt, caption, image }],  // 可選；圖文混排走既有 figures 機制，值為存儲鍵
    checklist: [String],    // 可選
    note: String,           // 可選
  }],
  faq: [{ question, answer }],             // 可選
  sources: [{ label, organization, url }],  // 可選；原文來源由 skill 放入此處展示

  // ==== 管理欄位 ====
  origin: {                // 爬蟲來源記錄（僅入庫，不參與渲染）
    platform: "xiaohongshu" | "web",
    source_url: String,
    author: String,        // 可選
    scraped_at: String,    // 可選
  },
  status: "draft" | "published",
  created_at: Date,
  updated_at: Date,
}
```

索引：`slug`（unique）、`status + publishedDate`（列表查詢）、`status + category`。

規則：
- **圖片一律存儲儲鍵**（`articles/<slug>/<filename>`），API 回傳時才拼完整 URL。遷移存儲後端不動資料。
- 文件結構完整鏡像前端 `Guide` 介面（`apps/jikeyuan/src/content/guides.ts`），含 `phase`、`steps`、`table`、`faq`。
- 對外響應（`ArticleOut`）剝離 `status/created_at/updated_at/origin`，回傳 `Guide` 形狀、`path` 由服務端計算為 `/guides/{slug}`、`image`/`figures[].image` 為完整 URL。
- `draft` 文章不對外公開（讀取端點只回 `published`）；預覽走 mongosh，本階段不做預覽端點。

## 4. API 設計

前綴 `/api`，端口 8000（前端 `.env.development` 的 `VITE_API_BASE_URL=http://localhost:8000/api` 已就緒，零改動）。響應沿用前端既有 `{ data: ... }` 包裝。

| 方法 | 路徑 | 認證 | 說明 |
|---|---|---|---|
| GET | `/api/guides` | 公開 | 已發布列表；`category`、`q`、`page`（默認 1）、`page_size`（默認 20，最大 50） |
| GET | `/api/guides/{slug}` | 公開 | 已發布單篇；404 若不存在或未發布 |
| POST | `/api/admin/articles` | `X-API-Key` | 匯入（upsert by slug） |
| DELETE | `/api/admin/articles/{slug}` | `X-API-Key` | 刪除文件並盡力刪除存儲圖片；孤立文件可接受 |
| GET | `/api/health` | 公開 | 含 MongoDB ping |

- 列表排序：`publishedDate` 降冪（必填欄位，無缺失情況），同值按 `_id` 降冪。`q` 對 `title`/`description` 做不區分大小寫正則匹配（小規模夠用；text index 留待有需要再加）。
- 列表響應：`{ data: { items: [ArticleOut], total, page, page_size } }`。
- 錯誤：HTTP 狀態碼 + FastAPI 標準 `{ detail: ... }`；寫入端點 API Key 不符回 401。
- API Key 用 `INGEST_API_KEY` 環境變量，`secrets.compare_digest` 比對。
- CORS：`CORS_ORIGINS` 環境變量（逗號分隔），默認 `http://localhost:5175,https://blog.openhomek.com`，`allow_credentials=true`（配合前端 axios `withCredentials`）。

### 匯入契約（POST /api/admin/articles）

multipart/form-data：

- `article`：JSON 字串（Guide 形狀 + `origin` + `status`），圖片引用一律寫 `file:<filename>`（如 `"image": "file:cover.jpg"`、`"sections[2].images": ["file:03.jpg"]`）
- `images`：文件部分，可多個，按 basename 匹配

服務端流程：Pydantic 驗證 → 校驗每個 `file:` 引用都有對應文件、每個文件都被引用（否則 422）→ 逐個上傳存儲後端得存儲鍵 → 替換佔位符 → 按 slug upsert → 回 `{ data: { slug, created } }`（新建 201 / 更新 200）。

限制：單文件 ≤ 10MB；每篇文章 ≤ 20 張圖。匯入中途失敗不寫庫（文件先驗後傳、全部成功才 upsert）。

## 5. 圖片存儲抽象

`STORAGE_BACKEND` 環境變量切換，介面：`put(key, bytes, content_type)` / `delete_prefix(prefix)` / `url_for(key)`：

| 後端 | 寫入位置 | 公開 URL |
|---|---|---|
| `local`（默認） | `apps/api/media/<key>`，StaticFiles 掛 `/media` | `MEDIA_PUBLIC_BASE_URL` 拼接（本機 `http://localhost:8000/media`） |
| `s3` | boto3 S3 兼容接口（`S3_ENDPOINT_URL`、`S3_BUCKET`、`S3_ACCESS_KEY_ID`、`S3_SECRET_ACCESS_KEY`）——R2/S3/OSS 通吃 | `MEDIA_PUBLIC_BASE_URL`（R2 公開域或自訂域） |

`apps/api/media/` 與 `.venv/` 加入根 `.gitignore`。

## 6. 前端對接（apps/jikeyuan）

1. **型別**：零改動——圖文混排複用既有 `GuideSection.figures`（`GuideFigure` 組件已渲染 `figure.image`），封面複用 `Guide.image`（`GuidePhoto` 已渲染）。
2. **API 模組**：新增 `src/apis/guides.ts`，基於既有 `publicHttp`：`fetchGuides(params)`、`fetchGuideBySlug(slug)`。
3. **詳情頁** `src/pages/Guide/index.tsx`：解析順序改為 靜態 `getGuideBySlug` → API `fetchGuideBySlug` → 404。API 載入中顯示載入態；請求失敗顯示「載入失敗 + 重試」（區別於 404）。找到後沿用全部既有組件渲染，並設定 `document.title`。
4. **列表頁** `src/pages/Guides/index.tsx`：靜態 3 篇與 API 文章合併、`latest` 排序按 `reviewedDate` 降冪（頁面既有慣例）、`useful` 維持靜態順序在前遠端在後；「載入更多」改為真分頁（拉 `page+1`，錯誤復用既有 load-more-error 提示樣式）；初始拉取失敗時仍顯示靜態文章 + 頂部錯誤提示條；既有 `?state=` QA 開關優先級不變（可繼續強制演示態）。
5. **合併邏輯**：抽成純函數模組（`src/pages/Guides/mergeGuides.ts`），靜態與遠端按 slug 去重（靜態優先），供 vitest 直接測試（倉庫測試慣例為純數據測試，無 DOM 測試基建，不新增）。
6. **vercel.json**：rewrites 陣列末尾加墊底規則 `{"source": "/guides/(.*)", "destination": "/index.html"}`（既有 3 個靜態條目在前，且 Vercel 靜態文件優先於 rewrites，不受影響）。
7. **SEO**：動態文章詳情頁用 `SeoMetadata` 設 `robots: noindex`，不進 sitemap（轉載內容的版權/重複內容風險；手寫 3 篇保持靜態 SEO 原樣）。

## 7. 服務結構與本機開發

```
apps/api/                  # 無 package.json，npm workspaces 自動忽略
  pyproject.toml           # requires-python >=3.12
  .env.example
  app/
    main.py                # app factory、CORS、/media 掛載、router 註冊
    config.py              # pydantic-settings：全部環境變量
    db.py                  # Motor client、ensure indexes
    storage.py             # local / s3 後端 + url_for
    schemas.py             # ArticleIn（file: 佔位契約）、ArticleOut
    routers/{guides,admin,health}.py
    services/{import_service,article_service}.py
  tests/                   # pytest + httpx + 本機 mongod 測試庫
```

- Python 3.12（brew `python@3.12`）+ `python3.12 -m venv` + pip。
- 依賴：`fastapi`、`uvicorn[standard]`、`motor`、`pydantic`、`pydantic-settings`、`python-multipart`、`boto3`；dev：`pytest`、`pytest-asyncio`、`httpx`。
- 啟動：`brew services start mongodb-community` → venv 內 `uvicorn app.main:app --reload --port 8000` → `npm run dev:jikeyuan`。

## 8. 測試與驗收

後端（pytest，打到本機 mongod 獨立測試庫，每測清空）：
- 匯入契約：佔位符替換、upsert 同 slug、缺文件 422、多餘文件 422、壞 JSON 422、無 API Key 401
- 讀取：分頁/排序/`category`/`q` 過濾、draft 不外露、404
- health：mongo ping

前端（vitest，沿用 `guides.test.ts` 模式）：
- `apis/guides.ts` 模組（mock axios）
- 列表合併與排序邏輯
- GuideSection 圖片渲染、詳情頁靜態→API→404 決策邏輯
- 既有測試保持綠

手動驗收（全鏈路）：
1. 起後端 + 前端 dev server
2. 用示例 curl 匯入一篇模擬小紅書輸出的文章（3 張圖 + 圖文混排 sections）
3. `/guides` 列表可見該文章（與靜態 3 篇合併），`/guides/<slug>` 詳情完整渲染圖片與段落
4. 重複匯入同 slug → 文章更新而非重複

## 9. 上雲路徑（本階段只保證可上，不實際部署）

全部配置走環境變量，遷移零程式碼改動：
- MongoDB → MongoDB Atlas（`MONGO_URI`）
- 存儲 → `STORAGE_BACKEND=s3` + R2 keys（`S3_*`）+ `MEDIA_PUBLIC_BASE_URL`（R2 公開域）
- `CORS_ORIGINS` 補正式域名；`INGEST_API_KEY` 換強值
- uvicorn 跑 Railway / Render / Fly / VPS 皆可（之後再決定平台，可加 Dockerfile）

## 10. 風險備註

- **版權**：轉載小紅書/網站內容公開展示有版權風險。設計已緩解：`noindex` 不做 SEO 獲益、`sources` 保留原作者與原文鏈結、`status` 支持先 draft 內部審。是否公開發布由用戶自行把握。
- **SEO 不對稱**：動態文章為客戶端渲染，無 per-page 靜態 HTML/meta。若日後要 SEO，可加「構建期拉 slug 清單生成靜態 HTML」的增強，不在本階段。
- **`q` 搜索用正則**：文章量大（> 萬級）後需換 text index / 搜索服務，屆時再說。
