# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

剛到香港的人，兩條主線並重：

- **學生（內地／海外新生）**：抵港前到開學頭幾個月，要安頓租屋、入境證件、銀行戶口、交通出行、電話網絡、校園生活。
- **新居民（來港工作／家庭）**：融入與安頓，情境偏就業、住屋、家庭事務。

共同處境：人生地不熟、資訊分散且時效敏感、容易走彎路。他們要的不是萬用懶人包，而是「現在、在香港、照著做就成立」的可行步驟，以及能問到走過同一段路的人。

## Product Purpose

讓剛到香港的人**少走一點彎路**：用一手核實的生活攻略加上即時的社區問答，把「找不到答案」變成「問得到、做得到」。成功代表產品在發揮作用的三個訊號：問答閉環成立（有人問、有人答、被解決）、攻略被信任使用（查得到、照著做、會收藏回訪）、社群留住同路人（註冊、提問、回答、收藏的回流）。

## Positioning

兩個鄰近產品都說不出的差異，是有解的定位錨點：

1. **攻略＋問答是同一條路（閉環）**：一手核實的指南與即時的社區問答互相承接——在攻略找不到答案時，能立刻把同一個問題帶進發問流程。一般論壇沒有核實指南；靜態攻略網沒有活問答。
2. **地域時效聚焦**：專注香港新抵達情境，內容可執行、標示最後核實日期，過期就誠實標示。這不是旅遊明信片式港資訊，而是安頓生活的操作手冊。

作者身份線索（學校、來港年份）是讓答案更可信的輔助特徵，非定位主張本身。

## Operating Context

- **地域與語言**：香港；介面為繁體中文（香港），文案自然混合香港常用書面語（如「搵」「咩」「伏」），但不為口語而口語。
- **使用時點**：抵港前焦慮期到落地頭幾個月，多在 mobile 查、在 desktop 詳讀與發問。
- **任務場域**：入境證件、租房住宿、銀行支付、交通出行、電話網絡、校園生活（產品分類以此為骨架）。
- **內容時效**：高風險資訊（流程、費用、文件）必須顯示最後核實日期；這是使用者信任的來源。

## Capabilities and Constraints

現有實作（程式碼為證）：

- React 19 + Vite + TypeScript，monorepo 內 app `@react-monorepo/jikeyuan`；UI 來自內部套件 `@react-monorepo/ui`（shadcn/ui 風格）；圖示用 `@phosphor-icons/react`；樣式 Tailwind v4；狀態 Redux Toolkit；路由 react-router-dom 7；通知 sonner。
- 已上線路由：`/`（首頁）、`/community`（社區問答）、`/guides`（攻略列表，本輪新增）、`/guides/:slug`（攻略詳情）、`/login`、`/register`、`/questions/new`（發問頁）。
- 社群頁與發問頁採「狀態驅動展示板」模式：以 `?state=` URL 參數切換 ready/loading/empty/error 等狀態，便於設計審查。

明確尚未決定／未做（未來工作不得假裝已存在）：

- `/questions/:questionId`（問題詳情／回答串）、`/me`（我的帳戶）尚未實作；攻略收藏目前為 localStorage 本地暫存，跨裝置同步待帳號系統接入。
- 真實提問／回答 submit API、`AuthOnly` 登入路由守護尚未接上（目前發問頁的提交為模擬流程）。
- Community「提出問題」CTA 尚未導向 `/questions/new?title=`，0 結果 → 發問的閉環未接通。

## Brand Commitments

- **名稱與標識**：有解（jikeyuan）；標誌已於近期重塑（`src/assets/logo.svg`）。
- **語氣**：像一個已經安頓下來的學長姐在帶路——直接、可用、不賣弄。
- **已承諾的視覺語言（binding，已編碼於 `style.css` tokens 與各頁實作）**：Airbnb-inspired——純白 canvas `#FFFFFF`、近黑文字 `#222222`、單一品牌主色 Rausch `#FF385C`、soft surface `#F7F7F7`、hairline `#DDDDDD`；字體 Inter（Cereal 的開源替代）；按鈕 8px、卡片約 14px、搜尋為 pill；幾乎無陰影；不用漸層、emoji、過度粗重標題或 SaaS dashboard 風格。照片與真實內容承擔視覺重量。**完整權威設計系統 = repo 根目錄的 [`DESIGN.md`](../../DESIGN.md)**（Airbnb 設計分析，含 colors／typography／rounded／spacing／components 全 token）；各頁落地狀態見 `apps/jikeyuan/design-qa.md`。

## Evidence on Hand

- `apps/jikeyuan/MVP-PAGE-DESIGN-BRIEF.md`：9 條路由規劃、各頁 Product Design 提示詞、共用設計上下文。
- 已實作頁面（Home、Community、Login、Register、Guide、AskQuestion）作為既有視覺與內容真實性的權威。
- 全站真實繁體港式範例內容（如「港大附近租房有哪些坑？中介話免佣可信嗎？」）。
- **不得憑空捏造**：真實使用者見證、客戶、數據、媒體報導、下載量、評分目前皆無；後端 Q&A 資料尚未存在。

## Product Principles

1. **攻略與問答是同一條路**：指南與社區問答互相承接，沒有答案就能立刻發問——閉環優先於任何單一頁面的華麗。
2. **可用且時效可信**：內容必須可執行、標示核實日期；過期就誠實標示，不假裝永遠新鮮。
3. **為香港新抵達者而寫**：真實繁體港式書面語、真實情境，不寫萬用 lorem 或灰色 placeholder。
4. **低摩擦、克制的介面**：照片與真實內容承擔重量，UI 安靜（承諾的 Airbnb-inspired 約束）。
5. **先驗證核心假設再補留存**：MVP 先證「問→答」與「攻略被信任」兩條價值鏈成立，再補我的帳戶與回流。

## Accessibility & Inclusion

- WCAG AA 對比、全程可見的鍵盤 focus、表單錯誤狀態與訊息、touch target 至少 44px（次要 chip 可例外，與既有頁一致）。
- 真實繁體港式內容，避免英文或簡體預設；新抵達者可能對在地流程焦慮，介面語氣需安撫而非催促。
