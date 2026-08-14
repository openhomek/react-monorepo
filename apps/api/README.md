# jikeyuan-api（有解攻略文章服務）

FastAPI + MongoDB。接收爬蟲整理後的攻略文章（文字 + 圖片），供 jikeyuan 前端渲染。

## 本機開發

```bash
brew services start mongodb-community@7.0
cd apps/api
python3.12 -m venv .venv            # 首次
.venv/bin/pip install -e '.[dev]'   # 首次
.venv/bin/uvicorn app.main:app --reload --port 8000
```

環境變量見 `.env.example`（本機開發有默認值，可不建 .env）。

## 測試

```bash
cd apps/api && .venv/bin/pytest -v
```

## 匯入一篇文章（爬蟲 skill 契約）

`POST /api/admin/articles`，Header `X-API-Key`，multipart：

- `article`：JSON 字串。結構 = 前端 `Guide` 介面（camelCase，見 `app/schemas.py`）+ `origin` + `status`
- `images`：圖片文件，可多個；JSON 中以 `file:<文件名>` 佔位（`image` 與 `sections[].figures[].image`）

規則：slug 唯一（重複匯入 = 更新）；單圖 ≤ 10MB；每篇 ≤ 20 張；文件名限 `[A-Za-z0-9._-]`；
`category` 建議用站點既有分類（入境證件/租房住宿/銀行支付/交通出行/電話網絡/校園生活）。

示例：`.venv/bin/python scripts/seed_example.py`（先起服務）

## 上雲（零程式碼改動）

- MongoDB → MongoDB Atlas：改 `MONGO_URI`
- 圖片 → R2/S3/OSS：`STORAGE_BACKEND=s3` + `S3_*` + `MEDIA_PUBLIC_BASE_URL`（公開域）
- `INGEST_API_KEY` 換強值；`CORS_ORIGINS` 補正式域名
