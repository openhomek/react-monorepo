# 有解（jikeyuan）MVP 頁面與 Product Design 提示詞

## 結論

目前已有 3 個 route 頁面：

1. `/` 首頁
2. `/login` 登入
3. `/register` 註冊

若 MVP 的核心承諾是「讓剛到香港的人找到可靠攻略、提出問題，並從同路人獲得答案」，建議再完成 **6 個 route 頁面**。完成後 MVP 共 **9 個 route 頁面**。

這 6 頁形成兩條可閉環的核心旅程：

- 找答案：首頁 → 社區／搜尋 → 問題詳情 → 回答或收藏
- 找攻略：首頁 → 攻略列表 → 攻略詳情 → 收藏
- 沒有答案：任何搜尋結果 → 發問 → 問題詳情

## 共用設計上下文（貼在每個提示詞前）

```text
為「有解」設計一個 responsive consumer web app 頁面。有解服務剛到香港的學生與新居民，核心價值是「少走一點彎路」：透過新生攻略、生活指南與社區問答，找到同校、同城、同路的人。

沿用現有首頁、登入與註冊頁的視覺系統，以及附件 design.md 的 Airbnb-inspired 設計語言：純白 #FFFFFF canvas、近黑 #222222 文字、單一品牌主色 Rausch #FF385C、soft surface #F7F7F7、hairline #DDDDDD；Inter 作為字體替代；8px 圓角按鈕、約 14px 卡片圓角、pill search；幾乎無陰影，只在浮動搜尋、dropdown 或 sticky card 使用單一輕陰影。照片與真實內容承擔視覺重量，不使用漸層、emoji、過度粗重標題或 SaaS dashboard 風格。

沿用現有 header/footer、logo、1200px 內容容器、mobile <744px、tablet 744–1128px、desktop >1128px。繁體中文（香港）介面，文案自然混合香港常用書面語；所有 controls 需有清楚 hover、focus、disabled、loading、empty、error 狀態；touch target 至少 44px。使用真實、可信的香港新生內容與人物資料，不要 lorem ipsum 或灰色 placeholder。
```

---

## P0 — 核心產品閉環（先設計）

### 1. 社區／搜尋結果頁

**Route 建議：** `/community?q=&category=&sort=`

**為什麼必須：** 首頁的「進入社區」、「查看全部熱門帖子」、分類 chips 和搜尋入口目前都沒有真正目的地。這一頁負責探索、篩選與搜尋，也避免再拆一個重複的搜尋頁。

**Product Design 提示詞：**

```text
設計「有解」社區／搜尋結果頁，desktop 1440×1024 與 mobile 390×844。頁面首要任務是讓剛到香港的使用者在 10 秒內找到相關問題，或確認沒有答案後立即發問。

Header 下方放一個 prominent pill search，預填查詢「港大附近租房有哪些坑？」；搜尋下方是可水平滑動的分類 chips：全部、入境證件、租房住宿、銀行支付、交通出行、電話網絡、校園生活。主內容提供 tabs「最新、熱門、待回答」與結果數；每列顯示分類、問題標題、2 行摘要、作者可信線索（學校／來港年份）、回答數、瀏覽數、時間、已解決狀態。右側 desktop 可有精簡 sticky rail：發問 CTA、社區守則摘要、熱門標籤；mobile 改為底部 sticky「發問」按鈕。

呈現 4 個關鍵狀態：正常列表、搜尋結果、0 結果、loading skeleton。0 結果要保留查詢字串並提供主要 CTA「用這個問題發問」，次要 CTA「清除篩選」。點擊貼文進問題詳情；點擊發問進發問頁。不要做論壇年代感的密集表格，也不要做卡片牆；使用清楚 hairline 分隔的 editorial list。
```

### 2. 問題詳情／回答串頁

**Route 建議：** `/questions/:questionId`

**為什麼必須：** 沒有詳情與回答串，社區內容只能看標題，產品核心價值無法交付。

**Product Design 提示詞：**

```text
設計「有解」問題詳情與回答串頁，desktop 1440×1100 與 mobile 390×844。示例問題：「港大附近租房有哪些坑？中介話免佣可信嗎？」

首屏包含 breadcrumb、分類 badge、問題標題、完整描述、相關圖片（如有）、作者身份與可信線索、發佈時間、瀏覽數，以及收藏、分享、檢舉等次要操作。問題下方清楚顯示回答數與排序「最有幫助／最新」。回答需展示作者 avatar、學校或居住區、來港年份、回答內容、時間、有幫助投票、留言；其中一則由提問者標為「已採納答案」，使用克制的品牌色或 success treatment，不使用亮綠大面積填色。

Desktop 採約 760px 主欄＋280px sticky side rail；side rail 顯示「你的經驗可能幫到他」回答 CTA、相關問題。Mobile 單欄，底部 sticky「寫回答」。未登入者點回答時顯示登入要求；作者可編輯／刪除自己的問題；同時設計無回答 empty state、提交回答 loading、提交失敗與成功狀態。閱讀體驗優先，避免過多框線和深陰影。
```

### 3. 發問頁

**Route 建議：** `/questions/new`

**為什麼必須：** 首頁 hero 現在只把問題記錄在本地，沒有真正建立社區內容。

**Product Design 提示詞：**

```text
設計「有解」發問頁，desktop 1440×960 與 mobile 390×844。這是登入後流程；若從搜尋 0 結果進入，標題欄要自動帶入原查詢。

用單一、低摩擦表單：問題標題（顯示剩餘字數）、分類必選、詳細描述 rich textarea、最多 4 張圖片上傳、匿名發問 toggle。分類包括入境證件、租房住宿、銀行支付、交通出行、電話網絡、校園生活。標題輸入後，在表單下方即時顯示 3 個「可能已有答案」的相似問題，避免重複發問。

Desktop 使用 720px 表單主欄＋右側「好問題小貼士」；mobile 單欄並在底部 sticky 顯示「發佈問題」。主 CTA 為 Rausch；次要操作為「儲存草稿」與「取消」。必須呈現：初始、相似問題建議、圖片 uploading、validation error、提交中、提交失敗、離開未儲存內容確認。發佈成功後導向新問題詳情，不做獨立成功頁。
```

### 4. 攻略列表／分類頁

**Route 建議：** `/guides?category=&q=`

**為什麼必須：** 首頁只有 6 張靜態預覽卡，「查看全部」只是展開；使用者無法真正探索內容庫。

**Product Design 提示詞：**

```text
設計「有解」攻略列表與分類頁，desktop 1440×1100 與 mobile 390×844。目標是讓剛到香港的人按當下任務快速找到可執行、具時效性的指南。

首屏使用小型 editorial heading「香港生活攻略」，附搜尋框與 6 個圖像分類 chips。正文頂部可有一個 featured guide（真實香港照片、標題、摘要、更新日期），下方為 3 欄 desktop／1 欄 mobile 的 photography-led guide cards。每張卡顯示分類、標題、2 行摘要、最後更新日期、預計閱讀時間、收藏按鈕；過期或待更新內容要有清楚但克制的 freshness label。

提供分類篩選、排序「最實用／最新」和 pagination 或 load more。設計正常、loading skeleton、空分類、搜尋 0 結果與未登入收藏提示。不要複製電商商品卡，不顯示價格或星級；照片應為真實香港交通、校園、住屋、銀行場景，避免旅遊明信片感。
```

### 5. 攻略詳情頁

**Route 建議：** `/guides/:slug`

**為什麼必須：** 攻略是產品的第二條核心價值鏈，沒有可閱讀、可收藏的內容頁便無法交付。

**Product Design 提示詞：**

```text
設計「有解」攻略詳情頁，desktop 1440×1200 與 mobile 390×844。示例文章：「入境香港流程與時間線（2026 最新版）」。優先服務第一次辦理流程、容易焦慮、需要確認資訊是否仍有效的讀者。

首屏包含 breadcrumb、分類、22–28px 標題、摘要、作者／編輯身份、最後核實日期、閱讀時間、收藏與分享，以及一張真實香港相關 hero photo。正文使用 680–720px 可讀欄寬，包含 sticky 目錄（desktop）、分步 checklist、重要提醒 callout、文件清單、官方來源 external links 與常見問題。每個高風險資訊顯示「最後核實」；頁尾有「這篇有幫助嗎？」、內容更正、相關攻略與相關社區問題。

Mobile 提供收合目錄與底部 bookmark/share actions。設計一般文章、已收藏、外部連結提示、內容過期警示和圖片載入失敗狀態。視覺要像可信生活指南，不要像部落格廣告頁；不得塞 sidebar 廣告。
```

## P1 — 上線完整度（MVP 發佈前完成）

### 6. 我的帳戶（以 tabs 合併）

**Route 建議：** `/me?tab=saved|questions|answers|settings`

**為什麼必須：** 現有產品已承諾登入、收藏攻略與社區參與，但登入後只有姓名和登出，收藏與投稿沒有回訪入口。

**Product Design 提示詞：**

```text
設計「有解」我的帳戶頁，desktop 1440×1024 與 mobile 390×844。不要拆成多個 route；用 tabs 完成 MVP：收藏、我的提問、我的回答、帳戶設定。

頁首顯示簡潔 profile summary：avatar、顯示名稱、學校／所屬社群（可選）、來港年份（可選）、加入日期。收藏 tab 混合顯示攻略與問題，但提供 type filter；提問 tab 顯示已解決／待回答與回答數；回答 tab 顯示回答摘要及有幫助數；設定 tab 只保留 MVP 欄位：顯示名稱、avatar、學校、來港年份、電郵只讀、通知偏好、登出、刪除帳戶。

Desktop 使用 profile header＋水平 tabs；mobile 將 tabs 做可橫向滑動。設計每個 tab 的正常、loading、empty、error 狀態；empty state 要有具體 CTA，例如「去睇熱門攻略」或「提出第一個問題」。刪除帳戶用確認 modal，不建立額外頁。避免 dashboard KPI 卡、圖表與企業設定頁風格。
```

## 不新增 route、但必須補的狀態

- 忘記／重設密碼：先做成 `/login` 內的多步 state（電郵 → 驗證碼 → 新密碼），不另算頁。
- 使用條款與私隱政策：MVP 可先用一個 legal document route `/legal/:document` 共用同一 template，不需要兩套視覺設計；若以 route 數計算，會多 1 個技術頁面。
- 404、服務錯誤、刪除確認、檢舉、登入要求、分享成功：使用共用 error page／modal／toast，不各自算頁。
- 通知中心、公開他人 profile、私訊、排行榜、管理後台：先排除 MVP。

## 建議設計順序

1. 社區／搜尋結果
2. 問題詳情／回答串
3. 發問
4. 攻略列表
5. 攻略詳情
6. 我的帳戶

先設計前三頁，便能驗證「提問 → 得到回答」這個最關鍵產品假設；後三頁補齊留存與內容消費。

## Product Design 交付要求

每頁請交付：

- Desktop 1440px 與 mobile 390px 主畫面
- 正常、loading、empty、error 四類狀態（依頁面需要）
- 核心互動註解與 route 跳轉
- 可重用元件清單與 variant
- 與現有首頁／登入／註冊頁一致的 tokens
- 真實繁體中文（香港）內容，不使用 placeholder
- WCAG AA 對比、鍵盤 focus、表單 error、44px touch targets

