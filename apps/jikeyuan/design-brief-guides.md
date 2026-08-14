# /guides 攻略列表 — Surface Brief（重寫定案 2026-08-14）

Shape 定案（第二輪：按桌面 `guides.png` 六狀態設計參考重寫）。實作以此為準；衝突時以本文件 + `PRODUCT.md` + 根目錄 `DESIGN.md` 為準。

## 任務與受眾
- 訪客：剛到香港的學生／新居民，手機為主，處於「我現在要做某件事」的任務狀態。
- 模式：Operate 為主（照著找、照著做），夾一點 Read（評估可信與新鮮）。
- 核心任務：按任務分類找到一篇可執行、標示核實日期的攻略並收藏回訪；找不到時順接發問。

## 設計方向
- 視覺權威：`DESIGN.md` Airbnb 語言——純白 canvas、Rausch `#FF385C` 單一主色、近黑 `#222`、按鈕 8px／卡片 ~14px／pill 搜尋、近乎無陰影、Inter。`guides.png` 參考稿配色與此完全一致（#FF385C / #222222 / #F7F7F7 / #DDDDDD），屬既有世界校準，非新視覺世界。
- 結構：H1「香港生活攻略」＋副標 → pill 搜尋 → 6 分類 chips → 精選 hero（focal moment）→ 排序＋「共 N 篇攻略」→ 照片卡列表 → 載入更多。Desktop（≥1128）右 rail（攻略→發問閉環 CTA＋freshness 圖例）保留。
- 導航不動：全站 header（新生攻略／生活指南／社區，已與 guides.png 一致）與 footer、`/guides/:slug` 詳情頁、其他路由全部不碰。

## 文案替換（已拍板，照 guides.png）
| 位置 | 舊 | 新 |
|---|---|---|
| H1 副標 | 以官方資料核實、標示最後核實日期，照著做就成立 | 按你現在要做的事，找到可靠又最新的步驟。 |
| 搜尋佔位 | 搜尋攻略，例如：八達通、租約、簽證 | 搜尋銀行開戶、八達通、租房… |
| 結果計數 | 「N 篇攻略」 | 「共 N 篇攻略」，N 為真實篇數；查詢／分類前綴保留 |
| 錯誤態次按鈕 | 返回熱門攻略（`/#guides`） | 返回首頁（`/`） |
| 未登入 Sheet 標題 | 要將收藏同步到帳戶嗎？ | 登入後即可收藏 |

## 卡片資料（已拍板：不捏造）
- 卡片元資料＝「最後核實 {date}」＋「{N} 分鐘閱讀」；**不上觀看次數、不加熱門徽章**；計數顯示真實篇數（當前 3 篇）。
- 照片卡：3/2 圖、白色分類徽章、右上收藏鈕；無照片時品牌 duotone 佔位（`#fff7f8` 底＋分類 glyph，非灰方块）。
- 精選 hero（編輯精選，16/10）保留，僅「全部＋無查詢」時顯示且不重複入列表；網格 3/2/1 列斷點不變。

## 狀態板（9 個全保留，視覺按 guides.png 校準；沿用 `?state=` 慣例）
- `ready`：正常列表＋精選。
- `loading`：skeleton＝精選大塊＋卡行，圖片比例預留防 CLS。
- `error`：CloudX＋「暫時載入不到攻略／可能是系統忙碌，請稍後再試。」＋「重新載入」（紅描邊）＋「返回首頁」；篩選保留。
- `empty`：保留閉環版——「用這個問題發問」→ `/questions/new?title=`＋「清除篩選」＋並列建議攻略（guides.png 此格不可讀，以現行為準）。
- 分類 0 結果：克制提示＋「清除分類」。
- `guest-favorite`：Sheet＝「登入後即可收藏」＋說明（收藏跟帳號走、換裝置也看得到）＋紅底「登入」＋「稍後再設」（關閉）＋**「先收藏在這台裝置」**（本地收藏路徑保留，不砍）。
- `offline-cache`：頂部 WifiSlash 橫幅「你目前離線，顯示上次瀏覽的攻略」＋「最後更新：{快取時間}」＋「重新連線」；**快取內容從照片卡網格降級為縮圖行列表**（縮圖＋標題＋最後更新·閱讀時間）——形態變化誠實表達「這是快取」；移動端底部 sticky 重連保留。
- `offline-empty`：全頁離線（沿用 Community）。
- `load-more-error`：行內提示＋重試。
- 收藏：optimistic＋sonner 復原 toast；localStorage 本地暫存（無後端），跨裝置需登入 Sheet。

## URL 同步與排序
- `?q=` 搜尋、`?category=` 分類（aria-pressed chips）、`?sort=`（latest 預設／useful＝編輯序）。
- 載入更多（非分頁號），與 load-more-error 配套。

## 邊界與反目標
- 觸及：`pages/Guides/index.tsx`（重寫）、`content/guides.ts`（僅當需要快取時間戳等新欄位）。
- 不動：`/guides/:slug` 詳情頁、header/footer、導航、其他路由、`SeoMetadata`／`sitemap.xml`（已到位）。
- 反目標：觀看次數、熱門徽章、虛構計數、電商商品卡（價格／星級／作者頭像）、論壇密集表格、灌水卡牆、漸層、emoji、過粗標題；不捏造照片、見證、數據。照片為真實香港日常實景，非旅遊明信片。

## SEO 與 a11y
- `/guides` 為 CollectionPage、indexable；`?state=` 展示板 noindex；卡片為真實 `<a href="/guides/:slug">`。
- WCAG AA、鍵盤 focus、Sheet focus trap、結果數與 loading `aria-live`、≥44px 觸控（次要 chip 例外）、照片有 alt。

## 待補（資產）
- 攻略照片：`Guide.image` 接 `src/assets` 實景照片後即時顯示；未補前 duotone 佔位。
- 「待更新」過期門檻待內容團隊定；現有 3 篇皆 2026-08-14 新鮮。
- 實作完成後跑一次 `node <impeccable>/scripts/detect.mjs --json <targets>`（本 session 無自動 hook）。
