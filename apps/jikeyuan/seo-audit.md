# 有解 SEO 優化報告

## SEO summary

- 目標市場：香港
- 主要語言：繁體中文（`zh-Hant-HK`）
- 目標受眾：剛到香港的學生與新來港人士
- 頁面意圖：香港生活攻略與社區問答
- 主要主題：香港新生攻略、香港租房、銀行開戶、交通、電話網絡、校園生活

### Top priorities

1. 為每個可索引頁面提供獨立 title、description、canonical 與結構化資料。
2. 阻止登入、註冊及 `/community?state=...` 測試狀態進入搜尋索引。
3. 改善可抓取內部連結、soft-404 行為與首頁首屏圖片重量。

## Findings and actions

### High — on-page metadata

- Evidence：原始 HTML 僅有 `<title>有解</title>`，沒有 meta description，且所有 SPA 路由共用相同標題。
- Why it matters：搜尋使用者與搜尋引擎難以分辨首頁、社區、登入和註冊頁的目的。
- Action：新增 route-aware metadata；首頁和社區採用獨立標題與描述，並同步 Open Graph、Twitter 與 canonical。
- Verification：已在瀏覽器逐頁確認渲染後 `<head>`。

### High — indexing and canonicalization

- Evidence：6 個 UI 測試狀態使用 `/community?state=...`，原本沒有 noindex 或 canonical 規則；登入和註冊亦可被索引。
- Why it matters：可能產生低價值或重複索引 URL。
- Action：狀態 variants、登入和註冊均設定 `noindex, follow`；狀態 variants canonical 回 `/community`，Vercel 同時輸出 `X-Robots-Tag`。
- Verification：瀏覽器檢查顯示標準 `/community` 為 `index, follow`，狀態 URL 為 `noindex, follow` 且沒有 JSON-LD。

### High — language targeting

- Evidence：原始 `<html lang="zh-CN">` 與香港繁體中文內容不符。
- Why it matters：語言與區域訊號不準確，亦不利輔助科技選擇正確讀音。
- Action：改為 `zh-Hant-HK`，並設定 `og:locale=zh_HK`。
- Verification：所有路由實際 DOM 均為 `zh-Hant-HK`。

### Medium — crawlable internal links

- Evidence：頁尾大量 `#community`、`#community-posts` 等 fragment 在 `/community` 路由上並無對應內容，且無法清楚表達目標頁面。
- Why it matters：重要社區頁的發現與語意連結訊號偏弱。
- Action：改成真實 `/community` 或 `/#section` URL，並使用「本週熱門問答」「搜尋社區問題」等描述性 anchor。
- Verification：原始碼中均為帶 `href` 的標準 `<a>` 連結。

### Medium — soft 404

- Evidence：原始 Vercel 規則把所有未知路徑重寫至 `/index.html`。
- Why it matters：不存在的 URL 可能回傳成功狀態及通用 SPA 內容，形成 soft-404。
- Action：只對現有 SPA 路由 `/community`、`/login`、`/register` 重寫。
- Verification：`vercel.json` 已限制重寫範圍；正式部署狀態碼仍需部署後抽查。

### Medium — performance

- Evidence：首頁首屏 PNG 為 1.0 MB，1448×1086。
- Why it matters：首屏圖片下載時間可能拖慢 LCP。
- Action：轉為相同尺寸的 147 KB JPEG，加入 intrinsic width/height、`fetchPriority="high"` 及 async decoding。
- Verification：生產 build 使用新 JPEG；實際 Core Web Vitals 需部署後以真實使用者資料確認。

### Medium — structured data

- Evidence：原頁面沒有結構化資料。
- Action：只標示畫面可驗證的 `Organization`、`WebSite`、`WebPage`／`CollectionPage`，沒有捏造 FAQ、評分、評論或搜尋功能。
- Verification：首頁和社區輸出 JSON-LD；noindex 頁面不輸出。

## Recommended page elements

### Homepage

- Title：`香港新生攻略與生活問答｜有解`
- Meta description：`有解為剛到香港的學生與新來港人士整理入境、租房、銀行開戶、交通、電話網絡及校園生活攻略，亦可向走過同一段路的人發問。`
- H1：保留「有問題，就問走過同一段路的人」；它清楚承接品牌與社區價值。

### Community

- Title：`香港生活社區問答｜租房、銀行開戶、交通與校園｜有解`
- Meta description：`搜尋香港租房、銀行開戶、八達通、學生簽證及校園生活問題，參考同校、同城、同路人的實際經驗，找不到答案也可直接發問。`
- H1：保留「社區問答」。

## Prioritized action plan

### Do now

- [x] 獨立 route metadata
- [x] canonical 與 noindex 控制
- [x] 語言／區域設定
- [x] 可抓取內部連結
- [x] 限制 SPA rewrites
- [x] robots.txt
- [x] JSON-LD
- [x] 首屏圖片壓縮與尺寸保留

### Do next

- [ ] 確認正式公開網域並設定 `VITE_SITE_URL`。
- [ ] 有正式網域後生成只包含 `/` 與 `/community` 的 sitemap.xml，並加入 robots.txt。
- [ ] 未來問題詳情與攻略文章應使用獨立、可分享的 URL，而非只存在於互動狀態。
- [ ] 對需要準確性的入境、銀行、法律或簽證內容加入來源、更新日期與編輯責任資訊。

### Test and monitor

- [ ] 部署後用 Search Console URL Inspection 檢查渲染 HTML、canonical 和 noindex。
- [ ] 用 Rich Results Test／Schema Markup Validator 檢查 JSON-LD。
- [ ] 監測 LCP ≤ 2.5s、INP < 200ms、CLS < 0.1；這些是體驗目標，不是排名保證。
- [ ] 檢查不存在路徑是否回傳真正 404。

## Not verified

- 正式站公開 URL、HTTP 狀態、Search Console 所有權及實際索引狀態未提供。
- 正式網域未確認，因此沒有猜測 sitemap host 或 production canonical。
- 未提供指定關鍵字，這次沒有以 SERP 排名結果做內容差距研究。
