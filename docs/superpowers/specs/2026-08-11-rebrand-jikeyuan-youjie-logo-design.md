# Rebrand jikeyuan：港伴 → 有解

## 背景
jikeyuan app 的 header 品牌原本是純文字「港伴」。這次全面 rebrand 為「有解」，使用新設計的 vector 字標（原 `apps/logo.svg`：珊瑚紅膠囊底 `#FF3348` + 白色「有解」字樣，976×413）。

## 變更範圍

### 1. 資源檔案
- `apps/logo.svg` → `apps/jikeyuan/src/assets/logo.svg`（原位置不屬於任何 app，移入 jikeyuan 後避免雙份）
- 新建 `apps/jikeyuan/public/favicon.svg`：方形衍生版（珊瑚紅圓角方塊 + 白「有解」），用原文字 vector path 搭配 `transform` 縮放，視覺與 header 字標一致

### 2. Header（`apps/jikeyuan/src/pages/Layout/index.tsx`）
- 把 `<Link className="...">港伴</Link>` 改為 `<img>` 形式
- `import logo from '../../assets/logo.svg'`
- `<Link to="/" aria-label="有解" className="inline-flex items-center"><img src={logo} alt="有解" className="h-10 w-auto" /></Link>`
- 高度 `h-10`（40px）配合 header `h-20`（80px）

### 3. index.html（`apps/jikeyuan/index.html`）
- `<head>` 加 `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
- `<title>Web App</title>` → `<title>有解</title>`
- Vite 自動從 `public/` 提供 favicon

## 配色
網站 `--primary: #ff385c` 與 logo 底色 `#FF3348` 視覺一致，rebrand 無色彩衝突。

## 不在這次範圍
- `lang="zh-CN"` 不改（網站是繁體中文，理想為 `zh-HK`，但超出「換 logo」範圍）
- `apps/web`、`apps/admin` 仍為空模板，不處理
- title 維持純「有解」，不加副標
