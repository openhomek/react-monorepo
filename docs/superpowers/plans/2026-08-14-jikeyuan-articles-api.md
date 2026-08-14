# jikeyuan 攻略文章服務（FastAPI + MongoDB）實作計劃

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 FastAPI + MongoDB 文章服務（`apps/api`），承接爬蟲匯入的攻略文章（含圖片），並讓 jikeyuan 前端在現有 `/guides` 列表與 `/guides/:slug` 詳情頁渲染它們。

**Architecture:** 後端以 API Key 保護的匯入端點接收 multipart（文章 JSON + 圖片文件），圖片上傳到可切換的存儲後端（本機磁盤 / S3 兼容），文章按 `Guide` 介面形狀存入 MongoDB `articles` collection；公開讀取端點回傳 `{ data: ... }` 包裝的 `Guide` 形狀（圖片為完整 URL）。前端詳情頁「靜態 → API → 404」三段式解析，列表頁合併靜態與遠端文章並做真分頁。

**Tech Stack:** Python 3.12 + FastAPI + Motor + Pydantic v2 + boto3（僅 s3 後端）；React 19 + axios（既有 `publicHttp`）+ vitest。不新增任何前端 npm 依賴。

**Spec:** `docs/superpowers/specs/2026-08-14-jikeyuan-articles-api-design.md`（計劃以此 spec 為準，執行者兩份都要讀）

## Global Constraints

- 工作分支：`feat/jikeyuan-articles-api`（從 `main` 切出；Task 1 第一步建立，全部任務在此分支提交）
- Python：`python3.12`（brew），venv 在 `apps/api/.venv`，所有後端命令在 `apps/api` 目錄下用 `.venv/bin/…` 執行
- MongoDB：本機 `mongod`（`brew services start mongodb-community`），默認 `mongodb://localhost:27017`
- 後端測試：`cd apps/api && .venv/bin/pytest -v`（需 mongod 在跑；測試庫 `jikeyuan_api_test`）
- 前端測試：`npm test -w @react-monorepo/jikeyuan`（vitest run）；前端構建：`npm run build -w @react-monorepo/jikeyuan`（含 tsc 型別檢查）
- 響應包裝一律 `{ "data": ... }`（前端 axios 層既有約定）；寫入端點認證頭 `X-API-Key`
- 前端**不新增** npm 依賴；後端依賴僅：fastapi、uvicorn[standard]、motor、pydantic、pydantic-settings、python-multipart、boto3、（dev）pytest、pytest-asyncio、httpx
- 註釋與 UI 文案用繁體中文（跟隨倉庫慣例）；程式碼註釋密度跟隨現有文件（後端新文件可適量說明「為什麼」）
- 提交訊息沿用倉庫慣例：`feat(api): …` / `feat(jikeyuan): …` / `test(api): …`
- 既有測試必須保持綠：`apps/jikeyuan/src/content/guides.test.ts` 等不允許改紅

---

### Task 1: 後端骨架——apps/api 專案、config、health 端點、CORS

**Files:**
- Create: `apps/api/pyproject.toml`
- Create: `apps/api/.env.example`
- Create: `apps/api/app/__init__.py`（空文件）
- Create: `apps/api/app/config.py`
- Create: `apps/api/app/routers/__init__.py`（空文件）
- Create: `apps/api/app/routers/health.py`
- Create: `apps/api/app/main.py`
- Create: `apps/api/tests/__init__.py`（空文件）
- Create: `apps/api/tests/conftest.py`
- Create: `apps/api/tests/test_health.py`
- Create: `apps/api/media/.gitkeep`

**Interfaces:**
- Consumes: 無（首個後端任務）
- Produces:
  - `app.config.get_settings() -> Settings`（`lru_cache`；欄位見下方代碼）
  - `app.main.app`（FastAPI 實例；後續 Task 掛 router）
  - `app.routers.health.router`（`GET /api/health`，暫不 ping mongo——Task 2 補）
  - 測試環境約定：conftest 在 import app 前設 `MONGO_DB_NAME=jikeyuan_api_test`、`INGEST_API_KEY=test-ingest-key`、`MEDIA_ROOT=media_test`

- [ ] **Step 1: 建立分支與專案骨架**

```bash
cd /Users/Admin/projects/react-monorepo
git checkout -b feat/jikeyuan-articles-api
mkdir -p apps/api/app/routers apps/api/tests apps/api/media apps/api/scripts
touch apps/api/app/__init__.py apps/api/app/routers/__init__.py apps/api/tests/__init__.py apps/api/media/.gitkeep
```

- [ ] **Step 2: 寫 `apps/api/pyproject.toml`**

```toml
[project]
name = "jikeyuan-api"
version = "0.1.0"
description = "有解攻略文章服務（FastAPI + MongoDB）"
requires-python = ">=3.12"
dependencies = [
  "fastapi>=0.115",
  "uvicorn[standard]>=0.30",
  "motor>=3.5",
  "pydantic>=2.8",
  "pydantic-settings>=2.4",
  "python-multipart>=0.0.9",
  "boto3>=1.35",
]

[project.optional-dependencies]
dev = [
  "pytest>=8.3",
  "pytest-asyncio>=0.24",
  "httpx>=0.27",
]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
include = ["app*"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

- [ ] **Step 3: 建 venv 並安裝依賴**

```bash
cd apps/api
python3.12 -m venv .venv
.venv/bin/pip install -e '.[dev]'
```

Expected: 安裝成功無報錯。

- [ ] **Step 4: 寫 `apps/api/.env.example`**

```bash
# MongoDB
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=jikeyuan_api

# 匯入端點 API Key（本機開發值；上雲必換強值）
INGEST_API_KEY=dev-ingest-key

# CORS（逗號分隔）
CORS_ORIGINS=http://localhost:5175,https://blog.openhomek.com

# 圖片存儲：local（本機磁盤）或 s3（R2/S3/OSS）
STORAGE_BACKEND=local
MEDIA_ROOT=media
MEDIA_PUBLIC_BASE_URL=http://localhost:8000/media

# s3 後端專用（STORAGE_BACKEND=s3 時必填）
# S3_ENDPOINT_URL=https://<account>.r2.cloudflarestorage.com
# S3_BUCKET=jikeyuan-articles
# S3_ACCESS_KEY_ID=
# S3_SECRET_ACCESS_KEY=
```

- [ ] **Step 5: 寫 `apps/api/app/config.py`**

```python
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db_name: str = "jikeyuan_api"

    ingest_api_key: str = "dev-ingest-key"

    cors_origins: str = "http://localhost:5175,https://blog.openhomek.com"

    storage_backend: str = "local"
    media_root: str = "media"
    media_public_base_url: str = "http://localhost:8000/media"

    s3_endpoint_url: str | None = None
    s3_bucket: str | None = None
    s3_access_key_id: str | None = None
    s3_secret_access_key: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

- [ ] **Step 6: 寫失敗測試 `apps/api/tests/conftest.py` 與 `apps/api/tests/test_health.py`**

conftest.py（env 必須在 import app 之前設好）：

```python
import os
import shutil

import pytest

os.environ.setdefault("MONGO_DB_NAME", "jikeyuan_api_test")
os.environ.setdefault("INGEST_API_KEY", "test-ingest-key")
os.environ.setdefault("MEDIA_ROOT", "media_test")

from app.config import get_settings  # noqa: E402

get_settings.cache_clear()


@pytest.fixture(autouse=True)
def clean_media_root():
    """本地存儲的測試文件逐測清空。"""
    yield
    shutil.rmtree(get_settings().media_root, ignore_errors=True)
```

test_health.py：

```python
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client() -> TestClient:
    from app.main import app

    return TestClient(app)


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"data": {"status": "ok"}}


def test_health_allows_dev_origin(client: TestClient) -> None:
    response = client.get("/api/health", headers={"Origin": "http://localhost:5175"})

    assert response.headers["access-control-allow-origin"] == "http://localhost:5175"
    assert response.headers["access-control-allow-credentials"] == "true"
```

- [ ] **Step 7: 跑測試確認失敗**

Run: `cd apps/api && .venv/bin/pytest tests/test_health.py -v`
Expected: FAIL（`ModuleNotFoundError: No module named 'app.main'`）

- [ ] **Step 8: 寫 `apps/api/app/routers/health.py` 與 `apps/api/app/main.py`**

health.py：

```python
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    return {"data": {"status": "ok"}}
```

main.py：

```python
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers import health


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="jikeyuan-api")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix="/api")

    if settings.storage_backend == "local":
        Path(settings.media_root).mkdir(parents=True, exist_ok=True)
        app.mount("/media", StaticFiles(directory=settings.media_root), name="media")

    return app


app = create_app()
```

（`guides`/`admin` router 在 Task 4/5 加。）

- [ ] **Step 9: 跑測試確認通過**

Run: `cd apps/api && .venv/bin/pytest tests/test_health.py -v`
Expected: 2 passed

- [ ] **Step 10: 提交**

```bash
cd /Users/Admin/projects/react-monorepo
git add apps/api
git commit -m "feat(api): scaffold FastAPI service with config, health endpoint and CORS"
```

---

### Task 2: MongoDB 接線與文章 Pydantic 模型

**Files:**
- Create: `apps/api/app/db.py`
- Create: `apps/api/app/schemas.py`
- Modify: `apps/api/app/routers/health.py`（health 加 mongo ping）
- Modify: `apps/api/app/main.py`（lifespan 裡 `ensure_indexes()`）
- Modify: `apps/api/tests/conftest.py`（加 clean_database fixture）
- Test: `apps/api/tests/test_schemas.py`、`apps/api/tests/test_health.py`（補 ping 斷言）

**Interfaces:**
- Consumes: `app.config.get_settings()`
- Produces:
  - `app.db.get_client() -> AsyncIOMotorClient`、`app.db.get_db() -> AsyncIOMotorDatabase`、`app.db.ensure_indexes() -> None`
  - `app.schemas.ArticleIn`（匯入契約：欄位名與前端 `Guide` 介面完全一致，camelCase；另含 `origin`、`status`）
  - `app.schemas.ArticleOut`（`Guide` 形狀 + `path`；無 `origin/status/created_at/updated_at`）
  - 子模型：`GuideSource`、`GuideTableData`、`GuideFigureData`、`GuideSection`、`GuideFaqItem`、`ArticleOrigin`

- [ ] **Step 1: conftest 加數據庫 fixture（mongo 不在跑則明確報錯）**

在 `apps/api/tests/conftest.py` 追加（放在 `clean_media_root` 之前）：

```python
import motor.motor_asyncio  # noqa: E402


@pytest.fixture(autouse=True)
async def clean_database():
    """測試庫逐測清空；mongod 未啟動時給出明確指引。"""
    client = motor.motor_asyncio.AsyncIOMotorClient(get_settings().mongo_uri)
    try:
        await client.admin.command("ping")
    except Exception as error:  # noqa: BLE001
        pytest.exit(f"無法連接 MongoDB（{error}）。請先執行：brew services start mongodb-community", returncode=1)
    db = client[get_settings().mongo_db_name]
    await db.articles.delete_many({})
    await db.articles.create_index("slug", unique=True)
    yield
    await db.articles.delete_many({})
    client.close()
```

- [ ] **Step 2: 寫失敗測試 `apps/api/tests/test_schemas.py`**

```python
import pytest
from pydantic import ValidationError

from app.schemas import ArticleIn


def make_article() -> dict:
    return {
        "slug": "xhs-hk-3day-itinerary",
        "category": "交通出行",
        "title": "香港三天兩夜自由行攻略",
        "cardTitle": "香港三天兩夜自由行",
        "description": "尖沙咀、中環、太平山三日路線整理。",
        "publishedDate": "2026-08-13",
        "reviewedDate": "2026-08-14",
        "readingTime": "約 5 分鐘",
        "imageAlt": "香港三天兩夜路線圖",
        "image": "file:cover.jpg",
        "takeaways": ["第一天尖沙咀", "第二天中環", "第三天太平山"],
        "sections": [
            {
                "title": "Day 1 尖沙咀",
                "phase": "行程",
                "paragraphs": ["傍晚到尖沙咀海旁看夜景。"],
                "figures": [{"alt": "尖沙咀海旁", "caption": "尖沙咀海旁夜景", "image": "file:01.jpg"}],
            }
        ],
        "sources": [{"label": "原文", "organization": "小紅書", "url": "https://www.xiaohongshu.com/explore/xxx"}],
        "origin": {
            "platform": "xiaohongshu",
            "source_url": "https://www.xiaohongshu.com/explore/xxx",
            "author": "某博主",
        },
        "status": "published",
    }


def test_valid_article_parses() -> None:
    article = ArticleIn.model_validate(make_article())

    assert article.slug == "xhs-hk-3day-itinerary"
    assert article.sections[0].figures[0].image == "file:01.jpg"
    assert article.status == "published"


def test_slug_must_be_url_safe() -> None:
    payload = make_article()
    payload["slug"] = "Bad Slug!"

    with pytest.raises(ValidationError):
        ArticleIn.model_validate(payload)


def test_dates_must_be_iso_format() -> None:
    payload = make_article()
    payload["publishedDate"] = "2026/08/13"

    with pytest.raises(ValidationError):
        ArticleIn.model_validate(payload)


def test_status_defaults_to_draft() -> None:
    payload = make_article()
    del payload["status"]

    assert ArticleIn.model_validate(payload).status == "draft"


def test_origin_platform_is_limited() -> None:
    payload = make_article()
    payload["origin"]["platform"] = "tiktok"

    with pytest.raises(ValidationError):
        ArticleIn.model_validate(payload)
```

- [ ] **Step 3: 跑測試確認失敗**

Run: `cd apps/api && .venv/bin/pytest tests/test_schemas.py -v`
Expected: FAIL（`No module named 'app.schemas'`）

- [ ] **Step 4: 寫 `apps/api/app/schemas.py`**

```python
"""文章模型。欄位名與前端 Guide 介面（apps/jikeyuan/src/content/guides.ts）逐一對應。"""

from typing import Literal

from pydantic import BaseModel, Field

DATE_PATTERN = r"^\d{4}-\d{2}-\d{2}$"


class GuideSource(BaseModel):
    label: str
    organization: str
    url: str


class GuideTableData(BaseModel):
    caption: str | None = None
    columns: list[str]
    rows: list[list[str]]


class GuideFigureData(BaseModel):
    alt: str
    caption: str
    # 匯入時為 "file:<文件名>" 佔位符，入庫後為存儲鍵，API 回傳時為完整 URL
    image: str | None = None


class GuideSection(BaseModel):
    title: str
    phase: str
    paragraphs: list[str] | None = None
    steps: list[str] | None = None
    table: GuideTableData | None = None
    figures: list[GuideFigureData] | None = None
    checklist: list[str] | None = None
    note: str | None = None


class GuideFaqItem(BaseModel):
    question: str
    answer: str


class ArticleOrigin(BaseModel):
    platform: Literal["xiaohongshu", "web"]
    source_url: str
    author: str | None = None
    scraped_at: str | None = None


class ArticleBase(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9-]+$")
    category: str
    title: str
    cardTitle: str
    description: str
    publishedDate: str = Field(pattern=DATE_PATTERN)
    reviewedDate: str = Field(pattern=DATE_PATTERN)
    readingTime: str
    imageAlt: str
    image: str | None = None
    featured: bool | None = None
    takeaways: list[str]
    sections: list[GuideSection]
    faq: list[GuideFaqItem] | None = None
    sources: list[GuideSource]


class ArticleIn(ArticleBase):
    origin: ArticleOrigin | None = None
    status: Literal["draft", "published"] = "draft"


class ArticleOut(ArticleBase):
    # 服務端計算，匯入方不需要填
    path: str
```

- [ ] **Step 5: 跑 schemas 測試確認通過**

Run: `cd apps/api && .venv/bin/pytest tests/test_schemas.py -v`
Expected: 5 passed

- [ ] **Step 6: 寫 `apps/api/app/db.py`**

```python
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(get_settings().mongo_uri)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    return get_client()[get_settings().mongo_db_name]


async def ensure_indexes() -> None:
    db = get_db()
    await db.articles.create_index("slug", unique=True)
    await db.articles.create_index([("status", 1), ("publishedDate", -1)])
    await db.articles.create_index([("status", 1), ("category", 1)])
```

- [ ] **Step 7: health 加 ping + main 加 lifespan；補測試**

`app/routers/health.py` 整體替換為：

```python
from fastapi import APIRouter

from app.db import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    await get_db().command("ping")
    return {"data": {"status": "ok"}}
```

`app/main.py`：import 區加 `from contextlib import asynccontextmanager` 與 `from app.db import ensure_indexes`，`create_app` 之前加：

```python
@asynccontextmanager
async def lifespan(_: FastAPI):
    await ensure_indexes()
    yield
```

並把 `FastAPI(title="jikeyuan-api")` 改為 `FastAPI(title="jikeyuan-api", lifespan=lifespan)`。

test_health.py 的 `test_health_returns_ok` 改名為 `test_health_returns_ok_with_mongo_ping`（斷言不變——ping 失敗會拋 500 使測試紅）。

- [ ] **Step 8: 跑全部後端測試**

Run: `cd apps/api && .venv/bin/pytest -v`
Expected: 全部 passed（health 2 + schemas 5）

- [ ] **Step 9: 提交**

```bash
cd /Users/Admin/projects/react-monorepo
git add apps/api
git commit -m "feat(api): add MongoDB wiring, indexes and article schemas"
```

---

### Task 3: 圖片存儲抽象（local 後端 + 工廠 + S3 後端）

**Files:**
- Create: `apps/api/app/storage.py`
- Test: `apps/api/tests/test_storage.py`

**Interfaces:**
- Consumes: `app.config.get_settings()`
- Produces:
  - `app.storage.StorageBackend`（Protocol：`put(key: str, data: bytes, content_type: str) -> str`（返回 key）、`delete_prefix(prefix: str) -> None`、`url_for(key: str) -> str`）
  - `app.storage.LocalDiskStorage(root: str, public_base: str)`
  - `app.storage.S3Storage(endpoint_url, bucket, access_key_id, secret_access_key, public_base)`
  - `app.storage.get_storage() -> StorageBackend`（每次調用重新讀 settings，不緩存——方便測試）

- [ ] **Step 1: 寫失敗測試 `apps/api/tests/test_storage.py`**

```python
import pytest

from app.storage import LocalDiskStorage, get_storage


def test_local_put_writes_file_and_returns_key(tmp_path) -> None:
    storage = LocalDiskStorage(root=str(tmp_path), public_base="http://test/media")

    key = storage.put("articles/demo/cover.jpg", b"jpeg-bytes", "image/jpeg")

    assert key == "articles/demo/cover.jpg"
    assert (tmp_path / "articles" / "demo" / "cover.jpg").read_bytes() == b"jpeg-bytes"


def test_local_url_for_builds_public_url(tmp_path) -> None:
    storage = LocalDiskStorage(root=str(tmp_path), public_base="http://test/media/")

    assert storage.url_for("articles/demo/cover.jpg") == "http://test/media/articles/demo/cover.jpg"


def test_local_delete_prefix_removes_tree(tmp_path) -> None:
    storage = LocalDiskStorage(root=str(tmp_path), public_base="http://test/media")
    storage.put("articles/demo/cover.jpg", b"a", "image/jpeg")
    storage.put("articles/other/01.jpg", b"b", "image/jpeg")

    storage.delete_prefix("articles/demo/")

    assert not (tmp_path / "articles" / "demo").exists()
    assert (tmp_path / "articles" / "other" / "01.jpg").exists()


def test_factory_returns_local_backend_by_default() -> None:
    assert isinstance(get_storage(), LocalDiskStorage)


def test_factory_rejects_s3_with_missing_config(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.config import get_settings

    monkeypatch.setattr(get_settings.__wrapped__, "storage_backend", "s3")

    with pytest.raises(RuntimeError) as error:
        get_storage()

    assert "S3_ENDPOINT_URL" in str(error.value)
```

（`monkeypatch.setattr(get_settings.__wrapped__, …)` 直接改被 lru_cache 的實例屬性，避免動全局 env。）

- [ ] **Step 2: 跑測試確認失敗**

Run: `cd apps/api && .venv/bin/pytest tests/test_storage.py -v`
Expected: FAIL（`No module named 'app.storage'`）

- [ ] **Step 3: 寫 `apps/api/app/storage.py`**

```python
import shutil
from pathlib import Path
from typing import Protocol

from app.config import get_settings

S3_REQUIRED_SETTINGS = ("s3_endpoint_url", "s3_bucket", "s3_access_key_id", "s3_secret_access_key")


class StorageBackend(Protocol):
    def put(self, key: str, data: bytes, content_type: str) -> str: ...

    def delete_prefix(self, prefix: str) -> None: ...

    def url_for(self, key: str) -> str: ...


class LocalDiskStorage:
    def __init__(self, root: str, public_base: str) -> None:
        self._root = Path(root)
        self._public_base = public_base.rstrip("/")

    def put(self, key: str, data: bytes, content_type: str) -> str:
        path = self._root / key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return key

    def delete_prefix(self, prefix: str) -> None:
        shutil.rmtree(self._root / prefix, ignore_errors=True)

    def url_for(self, key: str) -> str:
        return f"{self._public_base}/{key}"


class S3Storage:
    def __init__(
        self,
        endpoint_url: str,
        bucket: str,
        access_key_id: str,
        secret_access_key: str,
        public_base: str,
    ) -> None:
        import boto3

        self._client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
        )
        self._bucket = bucket
        self._public_base = public_base.rstrip("/")

    def put(self, key: str, data: bytes, content_type: str) -> str:
        self._client.put_object(Bucket=self._bucket, Key=key, Body=data, ContentType=content_type)
        return key

    def delete_prefix(self, prefix: str) -> None:
        response = self._client.list_objects_v2(Bucket=self._bucket, Prefix=prefix)
        objects = [{"Key": item["Key"]} for item in response.get("Contents", [])]
        if objects:
            self._client.delete_objects(Bucket=self._bucket, Delete={"Objects": objects})

    def url_for(self, key: str) -> str:
        return f"{self._public_base}/{key}"


def get_storage() -> StorageBackend:
    settings = get_settings()
    if settings.storage_backend == "local":
        return LocalDiskStorage(root=settings.media_root, public_base=settings.media_public_base_url)
    if settings.storage_backend == "s3":
        missing = [name.upper() for name in S3_REQUIRED_SETTINGS if getattr(settings, name) is None]
        if missing:
            raise RuntimeError(f"STORAGE_BACKEND=s3 但缺少配置：{'、'.join(missing)}")
        return S3Storage(
            endpoint_url=settings.s3_endpoint_url,
            bucket=settings.s3_bucket,
            access_key_id=settings.s3_access_key_id,
            secret_access_key=settings.s3_secret_access_key,
            public_base=settings.media_public_base_url,
        )
    raise RuntimeError(f"未知的 STORAGE_BACKEND：{settings.storage_backend}")
```

（S3 後端不做單元測試——它是 boto3 薄封裝，上雲時以手動冒煙驗證；local 後端是本機與測試主力。）

- [ ] **Step 4: 跑測試確認通過**

Run: `cd apps/api && .venv/bin/pytest tests/test_storage.py -v`
Expected: 5 passed

- [ ] **Step 5: 提交**

```bash
cd /Users/Admin/projects/react-monorepo
git add apps/api
git commit -m "feat(api): add storage abstraction with local and S3 backends"
```

---

### Task 4: 匯入服務與 POST /api/admin/articles（API Key 保護）

**Files:**
- Create: `apps/api/app/services/__init__.py`（空文件）
- Create: `apps/api/app/services/import_service.py`
- Create: `apps/api/app/routers/admin.py`
- Modify: `apps/api/app/main.py`（掛 `admin.router`）
- Test: `apps/api/tests/test_import_api.py`

**Interfaces:**
- Consumes: `ArticleIn`、`get_db()`、`get_storage()`、`get_settings()`
- Produces:
  - `POST /api/admin/articles`：multipart `article`（JSON 字串）+ `images`（多文件）；成功回 `{"data": {"slug": ..., "created": true|false}}`（新建 201 / 更新 200）；錯誤 401/422
  - `DELETE /api/admin/articles/{slug}`：回 `{"data": {"slug": ..., "deleted": true}}`；404 若不存在
  - `import_service.import_article(db, storage, article: ArticleIn, files: dict[str, tuple[bytes, str]]) -> tuple[str, bool]`（返回 (slug, created)）
  - 常量：`import_service.MAX_IMAGES = 20`、`import_service.MAX_FILE_BYTES = 10 * 1024 * 1024`
  - 測試輔助（後續 Task 復用）：`tests/test_import_api.py` 導出 `API_KEY_HEADERS` 與 `post_article(client, payload_overrides=None, files=None)`

- [ ] **Step 1: 寫失敗測試 `apps/api/tests/test_import_api.py`**

```python
import json

from fastapi.testclient import TestClient

from tests.test_schemas import make_article

API_KEY_HEADERS = {"X-API-Key": "test-ingest-key"}


def post_article(
    client: TestClient,
    payload_overrides: dict | None = None,
    files: list | None = None,
):
    payload = make_article()
    if payload_overrides:
        payload.update(payload_overrides)
    default_files = [
        ("images", ("cover.jpg", b"cover-bytes", "image/jpeg")),
        ("images", ("01.jpg", b"figure-bytes", "image/jpeg")),
    ]
    return client.post(
        "/api/admin/articles",
        headers=API_KEY_HEADERS,
        data={"article": json.dumps(payload)},
        files=default_files if files is None else files,
    )


def test_import_creates_article(client: TestClient) -> None:
    response = post_article(client)

    assert response.status_code == 201
    assert response.json() == {"data": {"slug": "xhs-hk-3day-itinerary", "created": True}}


def test_import_same_slug_updates_not_duplicates(client: TestClient) -> None:
    post_article(client)
    response = post_article(client, payload_overrides={"title": "更新後標題"})

    assert response.status_code == 200
    assert response.json()["data"]["created"] is False
    # TODO(Task 5): 打開以下兩行（/api/guides 在 Task 5 落地）
    # list_response = client.get("/api/guides")
    # assert list_response.json()["data"]["total"] == 1


def test_import_rejects_missing_api_key(client: TestClient) -> None:
    response = client.post(
        "/api/admin/articles",
        data={"article": json.dumps(make_article())},
        files=[("images", ("cover.jpg", b"x", "image/jpeg"))],
    )

    assert response.status_code == 401


def test_import_rejects_wrong_api_key(client: TestClient) -> None:
    response = client.post(
        "/api/admin/articles",
        headers={"X-API-Key": "wrong"},
        data={"article": json.dumps(make_article())},
        files=[("images", ("cover.jpg", b"x", "image/jpeg"))],
    )

    assert response.status_code == 401


def test_import_rejects_bad_json(client: TestClient) -> None:
    response = client.post(
        "/api/admin/articles",
        headers=API_KEY_HEADERS,
        data={"article": "{not json"},
        files=[],
    )

    assert response.status_code == 422


def test_import_rejects_missing_image_file(client: TestClient) -> None:
    response = post_article(client, files=[("images", ("cover.jpg", b"cover", "image/jpeg"))])

    assert response.status_code == 422
    assert "01.jpg" in response.text


def test_import_rejects_unreferenced_image_file(client: TestClient) -> None:
    extra = [
        ("images", ("cover.jpg", b"a", "image/jpeg")),
        ("images", ("01.jpg", b"b", "image/jpeg")),
        ("images", ("02.jpg", b"c", "image/jpeg")),
    ]

    response = post_article(client, files=extra)

    assert response.status_code == 422
    assert "02.jpg" in response.text


def test_import_rejects_path_traversal_filename(client: TestClient) -> None:
    payload = make_article()
    payload["image"] = "file:../evil.jpg"

    response = client.post(
        "/api/admin/articles",
        headers=API_KEY_HEADERS,
        data={"article": json.dumps(payload)},
        files=[("images", ("../evil.jpg", b"x", "image/jpeg"))],
    )

    assert response.status_code == 422


def test_import_rejects_more_than_20_images(client: TestClient) -> None:
    payload = make_article()
    figures = [{"alt": f"圖{i}", "caption": f"圖{i}", "image": f"file:{i:02d}.jpg"} for i in range(21)]
    payload["sections"][0]["figures"] = figures

    response = client.post(
        "/api/admin/articles",
        headers=API_KEY_HEADERS,
        data={"article": json.dumps(payload)},
        files=[("images", (f"{i:02d}.jpg", b"x", "image/jpeg")) for i in range(21)],
    )

    assert response.status_code == 422


def test_import_stores_images_with_storage_keys(client: TestClient) -> None:
    post_article(client)

    from pathlib import Path

    from app.config import get_settings

    media_root = Path(get_settings().media_root)
    assert (media_root / "articles" / "xhs-hk-3day-itinerary" / "cover.jpg").read_bytes() == b"cover-bytes"
    assert (media_root / "articles" / "xhs-hk-3day-itinerary" / "01.jpg").exists()


def test_delete_removes_article_and_images(client: TestClient) -> None:
    post_article(client)

    response = client.delete("/api/admin/articles/xhs-hk-3day-itinerary", headers=API_KEY_HEADERS)

    assert response.status_code == 200
    assert (
        client.delete("/api/admin/articles/xhs-hk-3day-itinerary", headers=API_KEY_HEADERS).status_code
        == 404
    )
```

- [ ] **Step 2: conftest 提升 `client` fixture（供所有 API 測試共用）**

`tests/conftest.py` 追加：

```python
@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
```

（`with` 會跑 lifespan → `ensure_indexes()`。）同時刪掉 `test_health.py` 裡的本地 `client` fixture，改用 conftest 的。

- [ ] **Step 3: 跑測試確認失敗**

Run: `cd apps/api && .venv/bin/pytest tests/test_import_api.py -v`
Expected: FAIL（admin 路由不存在，404）

- [ ] **Step 4: 寫 `apps/api/app/services/import_service.py`**

```python
import re
from datetime import UTC, datetime

from fastapi import HTTPException
from motor.core import AgnosticDatabase

from app.schemas import ArticleIn
from app.storage import StorageBackend

FILENAME_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
MAX_IMAGES = 20
MAX_FILE_BYTES = 10 * 1024 * 1024


def collect_file_refs(article: ArticleIn) -> dict[str, str]:
    """收集 {文件名: 欄位路徑}。同一文件被多處引用只上傳一次。"""
    refs: dict[str, str] = {}

    def add(ref: str | None, path: str) -> None:
        if ref is not None and ref.startswith("file:"):
            refs.setdefault(ref[len("file:"):], path)

    add(article.image, "image")
    for section_index, section in enumerate(article.sections):
        for figure_index, figure in enumerate(section.figures or []):
            add(figure.image, f"sections[{section_index}].figures[{figure_index}].image")
    return refs


def _validate_filenames(refs: dict[str, str]) -> None:
    for filename in refs:
        if not FILENAME_PATTERN.match(filename):
            raise HTTPException(status_code=422, detail=f"非法圖片文件名：{filename}")


async def import_article(
    db: AgnosticDatabase,
    storage: StorageBackend,
    article: ArticleIn,
    files: dict[str, tuple[bytes, str]],
) -> tuple[str, bool]:
    refs = collect_file_refs(article)
    _validate_filenames(refs)
    if len(refs) > MAX_IMAGES:
        raise HTTPException(status_code=422, detail=f"每篇文章最多 {MAX_IMAGES} 張圖片")

    for filename in files:
        if filename not in refs:
            raise HTTPException(status_code=422, detail=f"上傳了未被引用的圖片：{filename}")
    missing = [name for name in refs if name not in files]
    if missing:
        raise HTTPException(status_code=422, detail=f"缺少圖片文件：{'、'.join(missing)}")

    uploaded_keys: dict[str, str] = {}
    for filename, (data, content_type) in files.items():
        if len(data) > MAX_FILE_BYTES:
            raise HTTPException(status_code=422, detail=f"圖片 {filename} 超過 10MB 上限")
        key = f"articles/{article.slug}/{filename}"
        storage.put(key, data, content_type)
        uploaded_keys[filename] = key

    resolved = article.model_copy(deep=True)
    if resolved.image is not None and resolved.image.startswith("file:"):
        resolved.image = uploaded_keys[resolved.image[len("file:"):]]
    for section in resolved.sections:
        for figure in section.figures or []:
            if figure.image is not None and figure.image.startswith("file:"):
                figure.image = uploaded_keys[figure.image[len("file:"):]]
    storage_keys = set(uploaded_keys.values())

    now = datetime.now(UTC)
    document = resolved.model_dump()
    document["storage_keys"] = sorted(storage_keys)  # 刪除時清理存儲用
    document["updated_at"] = now

    existing = await db.articles.find_one({"slug": article.slug}, {"created_at": 1})
    document["created_at"] = existing["created_at"] if existing is not None else now
    await db.articles.replace_one({"slug": article.slug}, document, upsert=True)
    return article.slug, existing is None
```

（單人匯入工具，find-then-replace 的併發窗口可接受；slug 唯一索引兜底。）

- [ ] **Step 5: 寫 `apps/api/app/routers/admin.py`**

```python
import secrets
from json import JSONDecodeError
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.config import get_settings
from app.db import get_db
from app.schemas import ArticleIn
from app.services.import_service import MAX_FILE_BYTES, import_article
from app.storage import get_storage

router = APIRouter(tags=["admin"])


async def require_api_key(x_api_key: str | None = None) -> None:
    expected = get_settings().ingest_api_key
    if x_api_key is None or not secrets.compare_digest(x_api_key, expected):
        raise HTTPException(status_code=401, detail="無效的 API Key")


def _parse_article(raw: str) -> ArticleIn:
    try:
        return ArticleIn.model_validate_json(raw)
    except ValidationError as error:
        raise HTTPException(status_code=422, detail=error.errors(include_url=False)) from error
    except JSONDecodeError as error:
        raise HTTPException(status_code=422, detail=f"article 不是合法 JSON：{error}") from error


@router.post("/admin/articles", dependencies=[Depends(require_api_key)])
async def create_or_update_article(
    article: str = Form(...),
    images: list[UploadFile] = File(default=[]),
) -> JSONResponse:
    parsed = _parse_article(article)

    files: dict[str, tuple[bytes, str]] = {}
    for upload in images:
        if upload.filename is None:
            continue
        name = Path(upload.filename).name
        if name in files:
            raise HTTPException(status_code=422, detail=f"重複的圖片文件名：{name}")
        if upload.size is not None and upload.size > MAX_FILE_BYTES:
            raise HTTPException(status_code=422, detail=f"圖片 {name} 超過 10MB 上限")
        files[name] = (await upload.read(), upload.content_type or "application/octet-stream")

    slug, created = await import_article(get_db(), get_storage(), parsed, files)
    status_code = 201 if created else 200
    return JSONResponse(status_code=status_code, content={"data": {"slug": slug, "created": created}})


@router.delete("/admin/articles/{slug}", dependencies=[Depends(require_api_key)])
async def delete_article(slug: str) -> dict:
    result = await get_db().articles.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="文章不存在")
    get_storage().delete_prefix(f"articles/{slug}/")
    return {"data": {"slug": slug, "deleted": True}}
```

（`require_api_key` 的 `x_api_key` 參數由 FastAPI 自動映射自 `X-API-Key` 請求頭。）

- [ ] **Step 6: main.py 掛 admin router 並跑測試**

`app/main.py` import 改 `from app.routers import admin, health`，`create_app` 加 `app.include_router(admin.router, prefix="/api")`。

Run: `cd apps/api && .venv/bin/pytest tests/test_import_api.py -v`
Expected: 全部 passed

- [ ] **Step 7: 全量後端測試 + 提交**

Run: `cd apps/api && .venv/bin/pytest -v`
Expected: 全部 passed

```bash
cd /Users/Admin/projects/react-monorepo
git add apps/api
git commit -m "feat(api): add authenticated article import and delete endpoints"
```

---

### Task 5: 公開讀取端點 GET /api/guides 與 /api/guides/{slug}

**Files:**
- Create: `apps/api/app/services/article_service.py`
- Create: `apps/api/app/routers/guides.py`
- Modify: `apps/api/app/main.py`（掛 `guides.router`）
- Test: `apps/api/tests/test_guides_api.py`
- Modify: `apps/api/tests/test_import_api.py`（還原 Task 4 註釋的斷言）

**Interfaces:**
- Consumes: `get_db()`、`get_storage()`、`ArticleOut`、`tests/test_import_api.py` 的 `post_article`/`API_KEY_HEADERS`
- Produces:
  - `GET /api/guides?category=&q=&page=&page_size=` → `{"data": {"items": [ArticleOut...], "total": int, "page": int, "page_size": int}}`（僅 `status=published`；`publishedDate` 降冪，同值按 `_id` 降冪；`page_size` 默認 20、上限 50）
  - `GET /api/guides/{slug}` → `{"data": ArticleOut}`；404 若不存在或 draft
  - `article_service.to_article_out(document: dict, storage: StorageBackend) -> ArticleOut`（`path` 計算為 `/guides/{slug}`；`image`/`figures[].image` 存儲鍵 → 完整 URL）

- [ ] **Step 1: 寫失敗測試 `apps/api/tests/test_guides_api.py`**

```python
from fastapi.testclient import TestClient

from tests.test_import_api import post_article


def seed(client: TestClient, overrides: dict | None = None, files: list | None = None) -> None:
    post_article(client, payload_overrides=overrides, files=files)


def test_list_returns_published_articles_with_urls(client: TestClient) -> None:
    seed(client)

    response = client.get("/api/guides")

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["total"] == 1
    assert data["page"] == 1
    assert data["page_size"] == 20
    guide = data["items"][0]
    assert guide["slug"] == "xhs-hk-3day-itinerary"
    assert guide["path"] == "/guides/xhs-hk-3day-itinerary"
    assert guide["image"] == "http://testserver/media/articles/xhs-hk-3day-itinerary/cover.jpg"
    assert guide["sections"][0]["figures"][0]["image"].endswith("/articles/xhs-hk-3day-itinerary/01.jpg")
    assert "status" not in guide
    assert "origin" not in guide


def test_list_hides_drafts(client: TestClient) -> None:
    seed(client, {"status": "draft"})

    response = client.get("/api/guides")

    assert response.json()["data"]["total"] == 0


def test_list_filters_by_category(client: TestClient) -> None:
    seed(client)
    seed(
        client,
        {
            "slug": "second-article",
            "category": "租房住宿",
            "image": None,
            "sections": [{"title": "段落", "phase": "行程", "paragraphs": ["x"]}],
        },
        files=[],
    )

    response = client.get("/api/guides", params={"category": "租房住宿"})

    data = response.json()["data"]
    assert data["total"] == 1
    assert data["items"][0]["slug"] == "second-article"


def test_list_searches_title_and_description(client: TestClient) -> None:
    seed(client)

    assert client.get("/api/guides", params={"q": "自由行"}).json()["data"]["total"] == 1
    assert client.get("/api/guides", params={"q": "不存在的詞"}).json()["data"]["total"] == 0


def test_list_paginates(client: TestClient) -> None:
    for index in range(3):
        seed(
            client,
            {
                "slug": f"article-{index}",
                "image": None,
                "sections": [{"title": "段落", "phase": "行程", "paragraphs": ["x"]}],
            },
            files=[],
        )

    page_one = client.get("/api/guides", params={"page": 1, "page_size": 2}).json()["data"]
    page_two = client.get("/api/guides", params={"page": 2, "page_size": 2}).json()["data"]

    assert page_one["total"] == 3
    assert [item["slug"] for item in page_one["items"]] == ["article-0", "article-1"]
    assert [item["slug"] for item in page_two["items"]] == ["article-2"]


def test_detail_returns_article(client: TestClient) -> None:
    seed(client)

    response = client.get("/api/guides/xhs-hk-3day-itinerary")

    assert response.status_code == 200
    assert response.json()["data"]["cardTitle"] == "香港三天兩夜自由行"


def test_detail_404_for_unknown_slug(client: TestClient) -> None:
    assert client.get("/api/guides/no-such-slug").status_code == 404


def test_detail_404_for_draft(client: TestClient) -> None:
    seed(client, {"status": "draft"})

    assert client.get("/api/guides/xhs-hk-3day-itinerary").status_code == 404
```

（seed 覆寫 `image: None` 時要同時傳 `files=[]`，否則 cover.jpg/01.jpg 變成「未被引用」被 422。）

- [ ] **Step 2: 跑測試確認失敗**

Run: `cd apps/api && .venv/bin/pytest tests/test_guides_api.py -v`
Expected: FAIL（`/api/guides` 404）

- [ ] **Step 3: 寫 `apps/api/app/services/article_service.py`**

```python
from app.schemas import ArticleOut
from app.storage import StorageBackend


def to_article_out(document: dict, storage: StorageBackend) -> ArticleOut:
    document = dict(document)
    document["path"] = f"/guides/{document['slug']}"
    if document.get("image") is not None:
        document["image"] = storage.url_for(document["image"])
    for section in document.get("sections", []):
        for figure in section.get("figures") or []:
            if figure.get("image") is not None:
                figure["image"] = storage.url_for(figure["image"])
    return ArticleOut.model_validate(document)
```

- [ ] **Step 4: 寫 `apps/api/app/routers/guides.py`**

```python
import re

from fastapi import APIRouter, HTTPException, Query

from app.db import get_db
from app.services.article_service import to_article_out
from app.storage import get_storage

router = APIRouter(tags=["guides"])


@router.get("/guides")
async def list_guides(
    category: str | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
) -> dict:
    query: dict = {"status": "published"}
    if category is not None:
        query["category"] = category
    if q:
        pattern = re.escape(q)
        query["$or"] = [
            {"title": {"$regex": pattern, "$options": "i"}},
            {"description": {"$regex": pattern, "$options": "i"}},
        ]

    db = get_db()
    total = await db.articles.count_documents(query)
    cursor = (
        db.articles.find(query, {"_id": 0})
        .sort([("publishedDate", -1), ("_id", -1)])
        .skip((page - 1) * page_size)
        .limit(page_size)
    )
    storage = get_storage()
    items = [to_article_out(document, storage).model_dump() for document in await cursor.to_list(length=page_size)]
    return {"data": {"items": items, "total": total, "page": page, "page_size": page_size}}


@router.get("/guides/{slug}")
async def get_guide(slug: str) -> dict:
    document = await get_db().articles.find_one({"slug": slug, "status": "published"}, {"_id": 0})
    if document is None:
        raise HTTPException(status_code=404, detail="攻略不存在")
    return {"data": to_article_out(document, get_storage()).model_dump()}
```

- [ ] **Step 5: main.py 掛 guides router；還原 Task 4 註釋的斷言；全量測試**

`app/main.py` import 改為 `from app.routers import admin, guides, health`，加 `app.include_router(guides.router, prefix="/api")`。同時把 `tests/test_import_api.py` 中 `# TODO(Task 5)` 註釋的兩行還原生效。

Run: `cd apps/api && .venv/bin/pytest -v`
Expected: 全部 passed（health 2 + schemas 5 + storage 5 + import 11 + guides 8）

- [ ] **Step 6: 提交**

```bash
cd /Users/Admin/projects/react-monorepo
git add apps/api
git commit -m "feat(api): add public guides list and detail endpoints"
```

---

### Task 6: 前端 API 模組 src/apis/guides.ts

**Files:**
- Create: `apps/jikeyuan/src/apis/guides.ts`
- Test: `apps/jikeyuan/src/apis/guides.test.ts`

**Interfaces:**
- Consumes: `publicHttp`（`src/apis/http.ts` 既有導出；響應 `{ data: ... }`）、`Guide` 型別（`src/content/guides.ts`）
- Produces:
  - `fetchGuides(params: { page?: number; page_size?: number }) -> Promise<RemoteGuidesPage>`，`RemoteGuidesPage = { items: Guide[]; total: number; page: number; page_size: number }`
  - `fetchGuideBySlug(slug: string) -> Promise<Guide>`（404 時拋 axios 錯誤，調用方判斷 `status === 404`）

- [ ] **Step 1: 寫失敗測試 `apps/jikeyuan/src/apis/guides.test.ts`**

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { publicHttp } from './http'

import { fetchGuideBySlug, fetchGuides } from './guides'

vi.mock('./http', () => ({
  publicHttp: { get: vi.fn() },
}))

const mockedGet = vi.mocked(publicHttp.get)

beforeEach(() => {
  mockedGet.mockReset()
})

describe('fetchGuides', () => {
  it('calls GET /guides with pagination params and unwraps envelope', async () => {
    const page = { items: [], total: 0, page: 1, page_size: 20 }
    mockedGet.mockResolvedValueOnce({ data: { data: page } })

    const result = await fetchGuides({ page: 2, page_size: 10 })

    expect(mockedGet).toHaveBeenCalledWith('/guides', { params: { page: 2, page_size: 10 } })
    expect(result).toEqual(page)
  })

  it('defaults to no params', async () => {
    mockedGet.mockResolvedValueOnce({ data: { data: { items: [], total: 0, page: 1, page_size: 20 } } })

    await fetchGuides()

    expect(mockedGet).toHaveBeenCalledWith('/guides', { params: {} })
  })
})

describe('fetchGuideBySlug', () => {
  it('calls GET /guides/:slug and unwraps envelope', async () => {
    const guide = { slug: 'demo', path: '/guides/demo' }
    mockedGet.mockResolvedValueOnce({ data: { data: guide } })

    const result = await fetchGuideBySlug('demo')

    expect(mockedGet).toHaveBeenCalledWith('/guides/demo')
    expect(result).toEqual(guide)
  })
})
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test -w @react-monorepo/jikeyuan -- src/apis/guides.test.ts`
Expected: FAIL（找不到 `./guides` 模組）

- [ ] **Step 3: 寫 `apps/jikeyuan/src/apis/guides.ts`**

```ts
import type { Guide } from '../content/guides'

import { publicHttp } from './http'

export interface RemoteGuidesPage {
  items: Guide[]
  total: number
  page: number
  page_size: number
}

export interface FetchGuidesParams {
  page?: number
  page_size?: number
}

interface GuidesListResponse {
  data: RemoteGuidesPage
}

interface GuideDetailResponse {
  data: Guide
}

export async function fetchGuides(params: FetchGuidesParams = {}): Promise<RemoteGuidesPage> {
  const response = await publicHttp.get<GuidesListResponse>('/guides', { params })
  return response.data.data
}

export async function fetchGuideBySlug(slug: string): Promise<Guide> {
  const response = await publicHttp.get<GuideDetailResponse>(`/guides/${slug}`)
  return response.data.data
}
```

- [ ] **Step 4: 跑測試確認通過 + 全量前端測試**

Run: `npm test -w @react-monorepo/jikeyuan`
Expected: 全部 passed（含既有 guides.test.ts）

- [ ] **Step 5: 提交**

```bash
cd /Users/Admin/projects/react-monorepo
git add apps/jikeyuan/src/apis/guides.ts apps/jikeyuan/src/apis/guides.test.ts
git commit -m "feat(jikeyuan): add guides API client module"
```

---

### Task 7: 列表頁合併渲染——mergeGuides 純函數 + Guides 頁接線

**Files:**
- Create: `apps/jikeyuan/src/pages/Guides/mergeGuides.ts`
- Modify: `apps/jikeyuan/src/pages/Guides/index.tsx`（合併資料源、真分頁、錯誤條）
- Test: `apps/jikeyuan/src/pages/Guides/mergeGuides.test.ts`

**Interfaces:**
- Consumes: `fetchGuides`（Task 6）、`Guide` 型別
- Produces: `mergeGuides(staticGuides: Guide[], remoteGuides: Guide[], sort: 'latest' | 'useful') -> Guide[]`（slug 去重靜態優先；`latest` 按 `reviewedDate` 降冪；`useful` 靜態順序在前、遠端在後）

- [ ] **Step 1: 寫失敗測試 `apps/jikeyuan/src/pages/Guides/mergeGuides.test.ts`**

```ts
import { describe, expect, it } from 'vitest'

import type { Guide } from '../../content/guides'

import { mergeGuides } from './mergeGuides'

function makeGuide(slug: string, reviewedDate: string): Guide {
  return {
    slug,
    path: `/guides/${slug}`,
    category: '交通出行',
    title: slug,
    cardTitle: slug,
    description: '',
    publishedDate: reviewedDate,
    reviewedDate,
    readingTime: '約 1 分鐘',
    imageAlt: '',
    takeaways: [],
    sections: [],
    sources: [],
  }
}

describe('mergeGuides', () => {
  const staticGuides = [makeGuide('static-a', '2026-08-01'), makeGuide('static-b', '2026-07-01')]
  const remoteGuides = [makeGuide('remote-x', '2026-08-14'), makeGuide('remote-y', '2026-06-01')]

  it('merges static and remote guides sorted by reviewedDate desc for latest', () => {
    const merged = mergeGuides(staticGuides, remoteGuides, 'latest')

    expect(merged.map((guide) => guide.slug)).toEqual(['remote-x', 'static-a', 'static-b', 'remote-y'])
  })

  it('keeps static order first and appends remote for useful', () => {
    const merged = mergeGuides(staticGuides, remoteGuides, 'useful')

    expect(merged.map((guide) => guide.slug)).toEqual(['static-a', 'static-b', 'remote-x', 'remote-y'])
  })

  it('drops remote guides whose slug collides with a static guide', () => {
    const colliding = [makeGuide('static-a', '2026-08-14')]

    const merged = mergeGuides(staticGuides, colliding, 'latest')

    expect(merged.filter((guide) => guide.slug === 'static-a')).toHaveLength(1)
    expect(merged[0].reviewedDate).toBe('2026-08-01')
  })

  it('returns static guides untouched when remote is empty', () => {
    const merged = mergeGuides(staticGuides, [], 'latest')

    expect(merged.map((guide) => guide.slug)).toEqual(['static-a', 'static-b'])
  })
})
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm test -w @react-monorepo/jikeyuan -- src/pages/Guides/mergeGuides.test.ts`
Expected: FAIL（`./mergeGuides` 不存在）

- [ ] **Step 3: 寫 `apps/jikeyuan/src/pages/Guides/mergeGuides.ts`**

```ts
import type { Guide } from '../../content/guides'

export type GuidesSort = 'latest' | 'useful'

export function mergeGuides(
  staticGuides: Guide[],
  remoteGuides: Guide[],
  sort: GuidesSort,
): Guide[] {
  const staticSlugs = new Set(staticGuides.map((guide) => guide.slug))
  const dedupedRemote = remoteGuides.filter((guide) => !staticSlugs.has(guide.slug))

  if (sort === 'useful') {
    return [...staticGuides, ...dedupedRemote]
  }

  return [...staticGuides, ...dedupedRemote].sort((a, b) =>
    b.reviewedDate.localeCompare(a.reviewedDate),
  )
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm test -w @react-monorepo/jikeyuan -- src/pages/Guides/mergeGuides.test.ts`
Expected: 4 passed

- [ ] **Step 5: 接線 `src/pages/Guides/index.tsx`（數據源部分）**

a) import 區（`import { type Guide, guides } from '../../content/guides'` 之後）加：

```ts
import { fetchGuides } from '../../apis/guides'
import { mergeGuides } from './mergeGuides'
```

b) `Guides()` 組件內，既有 state 宣告（`pendingSaveSlug`）之後加：

```ts
  const [remoteGuides, setRemoteGuides] = useState<Guide[]>([])
  const [remoteTotal, setRemoteTotal] = useState(0)
  const [remotePage, setRemotePage] = useState(0)
  const [remoteError, setRemoteError] = useState(false)
  const [loadMoreFailed, setLoadMoreFailed] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  async function loadRemotePage(page: number) {
    try {
      const result = await fetchGuides({ page, page_size: 20 })
      if (page === 1) {
        setRemoteGuides(result.items)
      } else {
        setRemoteGuides((current) => {
          const seen = new Set(current.map((guide) => guide.slug))
          return [...current, ...result.items.filter((guide) => !seen.has(guide.slug))]
        })
      }
      setRemoteTotal(result.total)
      setRemotePage(page)
      setRemoteError(false)
      setLoadMoreFailed(false)
    } catch {
      if (page === 1) {
        setRemoteError(true)
      } else {
        setLoadMoreFailed(true)
      }
    }
  }

  useEffect(() => {
    void loadRemotePage(1)
  }, [])
```

c) 把 `const baseGuides = sort === 'useful' ? guides : latestGuides` 替換為：

```ts
  const baseGuides = useMemo(
    () => mergeGuides(guides, remoteGuides, sort),
    [remoteGuides, sort],
  )
```

（`latestGuides` 的 useMemo 保留——`featuredGuide` fallback 仍在用。）

d) `saveControls` 定義附近加：

```ts
  const hasMoreRemote = remoteGuides.length < remoteTotal

  async function handleLoadMore() {
    if (loadingMore) return
    setLoadingMore(true)
    try {
      await loadRemotePage(remotePage + 1)
    } finally {
      setLoadingMore(false)
    }
  }
```

- [ ] **Step 6: 接線（UI 部分）**

a) 頁面 `<header>` 區塊之後（`<div className="mt-5 flex gap-7">` 之前）加初始錯誤條：

```tsx
      {remoteError && (
        <Alert className="mt-4 rounded-lg border-primary/30 bg-[#fff5f6]">
          <WarningCircle size={16} weight="fill" />
          <AlertDescription className="flex w-full items-center justify-between gap-3 text-sm text-[#c13515]">
            <span>部分攻略暫時載入不到，以下先顯示本地攻略。</span>
            <button
              type="button"
              className="shrink-0 font-semibold text-primary"
              onClick={() => void loadRemotePage(1)}
            >
              重試
            </button>
          </AlertDescription>
        </Alert>
      )}
```

b) 「載入更多」區塊（現 `state === 'load-more-error' ? … : listIsVisible && state !== 'offline-cache' ? …` 整個三元表達式）替換為：

```tsx
              {state === 'load-more-error' || loadMoreFailed ? (
                <Alert className="flex min-h-12 items-center justify-center gap-3 rounded-lg border-primary/30 bg-[#fff5f6] px-4 py-2 text-primary">
                  <WarningCircle size={16} weight="fill" />
                  <AlertDescription className="text-center text-sm text-[#c13515]">
                    載入更多攻略時遇到問題，請檢查網絡後再試。
                  </AlertDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg border-primary bg-white px-5 text-primary"
                    onClick={() => {
                      setLoadMoreFailed(false)
                      void handleLoadMore()
                    }}
                  >
                    再試一次
                  </Button>
                </Alert>
              ) : listIsVisible && state !== 'offline-cache' && hasMoreRemote ? (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="h-11 rounded-lg px-6"
                    onClick={() => void handleLoadMore()}
                    disabled={loadingMore}
                  >
                    {loadingMore ? '載入中…' : '載入更多'}
                  </Button>
                </div>
              ) : null}
```

（`?state=load-more-error` 演示開關仍命中同一個 Alert 樣式；demo 態下「再試一次」僅清除真錯誤態。）

- [ ] **Step 7: 型別檢查 + 全量前端測試**

Run: `npm run build -w @react-monorepo/jikeyuan && npm test -w @react-monorepo/jikeyuan`
Expected: tsc 無錯、vite build 成功、測試全綠

- [ ] **Step 8: 提交**

```bash
cd /Users/Admin/projects/react-monorepo
git add apps/jikeyuan/src/pages/Guides apps/jikeyuan/src/apis
git commit -m "feat(jikeyuan): merge remote guides into list page with real pagination"
```

---

### Task 8: 詳情頁 API fallback（靜態 → API → 404）

**Files:**
- Modify: `apps/jikeyuan/src/pages/Guide/index.tsx`

**Interfaces:**
- Consumes: `fetchGuideBySlug`（Task 6）、`getGuideBySlug`/`guides`（既有）、`Guide` 型別
- Produces: 無新介面——頁面對外行為：已知靜態 slug 行為完全不變；未知 slug 先拉 API；404 顯示既有 404 塊；其他錯誤顯示重試塊；遠端文章渲染後 `document.title = "{title}｜有解"`（SeoMetadata 對未知路徑本就 fallback noindex，robots 不需處理）

- [ ] **Step 1: 改寫 `Guide()` 組件的資料解析段**

`src/pages/Guide/index.tsx` 頂部：`import { useEffect } from 'react'` 改為 `import { useCallback, useEffect, useState } from 'react'`；加 `import axios from 'axios'`；加 `import { fetchGuideBySlug } from '../../apis/guides'`；icon import 行補 `CloudX`、`SpinnerGap`；若尚未引入則加 `import { type Guide } from '../../content/guides'`。

在 `function Guide()` 前加狀態型別：

```tsx
type RemoteGuideState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'loaded'; guide: Guide }
  | { phase: 'not-found' }
  | { phase: 'error' }
```

`function Guide() {` 起至 `if (guide === undefined) {` 之前的整段替換為：

```tsx
function Guide() {
  const { slug } = useParams()
  const staticGuide = getGuideBySlug(slug)
  const [remoteState, setRemoteState] = useState<RemoteGuideState>({ phase: 'idle' })

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  const loadRemote = useCallback(async () => {
    if (slug === undefined) {
      setRemoteState({ phase: 'not-found' })
      return
    }
    setRemoteState({ phase: 'loading' })
    try {
      const guide = await fetchGuideBySlug(slug)
      setRemoteState({ phase: 'loaded', guide })
      document.title = `${guide.title}｜有解`
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setRemoteState({ phase: 'not-found' })
      } else {
        setRemoteState({ phase: 'error' })
      }
    }
  }, [slug])

  useEffect(() => {
    if (staticGuide === undefined) {
      void loadRemote()
    } else {
      setRemoteState({ phase: 'idle' })
    }
  }, [staticGuide, loadRemote])

  if (remoteState.phase === 'loading') {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <SpinnerGap size={32} weight="regular" aria-hidden="true" className="animate-spin text-primary" />
        <p className="text-sm text-[#666666]">正在載入攻略…</p>
      </main>
    )
  }

  if (remoteState.phase === 'error') {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <CloudX size={52} weight="duotone" aria-hidden="true" className="text-[#929292]" />
        <h1 className="mt-4 text-2xl font-semibold">暫時載入不到這篇攻略</h1>
        <p className="mt-3 max-w-lg leading-7 text-[#666666]">可能是系統忙碌，請稍後再試。</p>
        <Button className="mt-7 rounded-full px-6" onClick={() => void loadRemote()}>
          重新載入
        </Button>
      </main>
    )
  }

  const guide = staticGuide ?? (remoteState.phase === 'loaded' ? remoteState.guide : undefined)

  if (guide === undefined) {
    return (
      /* 既有 404 區塊 JSX 原樣保留在此分支 */
    )
  }
```

其後 `const relatedGuides = guides.filter((item) => item.slug !== guide.slug)` 起全部渲染代碼不動。

- [ ] **Step 2: 型別檢查 + 構建 + 測試**

Run: `npm run build -w @react-monorepo/jikeyuan && npm test -w @react-monorepo/jikeyuan`
Expected: 無錯誤、測試全綠

- [ ] **Step 3: 提交**

```bash
cd /Users/Admin/projects/react-monorepo
git add apps/jikeyuan/src/pages/Guide/index.tsx
git commit -m "feat(jikeyuan): fall back to API lookup for remote guide detail pages"
```

---

### Task 9: 部署配置、示例腳本、README 與全鏈路驗收

**Files:**
- Modify: `apps/jikeyuan/vercel.json`（墊底 rewrite）
- Modify: `.gitignore`（Python/媒體目錄）
- Create: `apps/api/scripts/seed_example.py`
- Create: `apps/api/README.md`

**Interfaces:**
- Consumes: 全部前任務
- Produces: 可交付的完整鏈路（匯入 → 存儲 → 讀取 → 渲染）

- [ ] **Step 1: vercel.json 加墊底 rewrite**

`apps/jikeyuan/vercel.json` 的 `rewrites` 陣列**末尾**追加：

```json
    {
      "source": "/guides/(.*)",
      "destination": "/index.html"
    }
```

（既有 3 個 guide 條目在前，Vercel 靜態文件優先於 rewrites，原行為不變。）

- [ ] **Step 2: 根 `.gitignore` 追加**

```
# apps/api（Python 服務）
apps/api/.venv/
apps/api/media/
apps/api/media_test/
apps/api/.pytest_cache/
__pycache__/
*.py[cod]
```

- [ ] **Step 3: 寫示例匯入腳本 `apps/api/scripts/seed_example.py`**

```python
"""匯入一篇示例文章，用於本機全鏈路驗證。用法：.venv/bin/python scripts/seed_example.py"""

import asyncio
import base64
import json

import httpx

API_BASE = "http://localhost:8000/api"
API_KEY = "dev-ingest-key"

# 1x1 像素 PNG
PNG_1PX = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8BQDwAEBAF/6yL4AAAAAElFTkSuQmCC"
)

ARTICLE = {
    "slug": "xhs-hk-3day-itinerary",
    "category": "交通出行",
    "title": "香港三天兩夜自由行攻略（小紅書收錄）",
    "cardTitle": "香港三天兩夜自由行",
    "description": "尖沙咀、中環、太平山的三日路線與交通整理，來自小紅書博主實測。",
    "publishedDate": "2026-08-13",
    "reviewedDate": "2026-08-14",
    "readingTime": "約 5 分鐘",
    "imageAlt": "香港三天兩夜路線示意圖",
    "image": "file:cover.png",
    "takeaways": ["Day 1 尖沙咀夜景", "Day 2 中環＋山頂纜車", "Day 3 太平山＋返程"],
    "sections": [
        {
            "title": "Day 1：尖沙咀",
            "phase": "行程",
            "paragraphs": ["下午抵港後先去酒店寄存行李，傍晚到尖沙咀海旁看維港夜景。"],
            "figures": [
                {"alt": "尖沙咀海旁夜景", "caption": "尖沙咀海旁的維港夜景", "image": "file:day1.png"}
            ],
        },
        {
            "title": "Day 2：中環與山頂",
            "phase": "行程",
            "paragraphs": ["上午中環石板街、半山扶梯，下午搭山頂纜車上太平山。"],
            "note": "山頂纜車旺季排隊可達一小時，建議線上預購。",
        },
    ],
    "sources": [
        {"label": "原文", "organization": "小紅書", "url": "https://www.xiaohongshu.com/explore/example"}
    ],
    "origin": {
        "platform": "xiaohongshu",
        "source_url": "https://www.xiaohongshu.com/explore/example",
        "author": "示例博主",
    },
    "status": "published",
}


async def main() -> None:
    files = [
        ("images", ("cover.png", PNG_1PX, "image/png")),
        ("images", ("day1.png", PNG_1PX, "image/png")),
    ]
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{API_BASE}/admin/articles",
            headers={"X-API-Key": API_KEY},
            data={"article": json.dumps(ARTICLE)},
            files=files,
        )
        print(response.status_code, response.text)


if __name__ == "__main__":
    asyncio.run(main())
```

- [ ] **Step 4: 寫 `apps/api/README.md`**

````markdown
# jikeyuan-api（有解攻略文章服務）

FastAPI + MongoDB。接收爬蟲整理後的攻略文章（文字 + 圖片），供 jikeyuan 前端渲染。

## 本機開發

```bash
brew services start mongodb-community
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
````

- [ ] **Step 5: 全鏈路手動驗收（本機）**

```bash
brew services start mongodb-community
cd apps/api && .venv/bin/uvicorn app.main:app --port 8000
```

（另一個終端）

```bash
cd apps/api && .venv/bin/python scripts/seed_example.py
```

```bash
curl -s http://localhost:8000/api/guides | head -c 400
```

```bash
curl -s http://localhost:8000/api/guides/xhs-hk-3day-itinerary | head -c 400
```

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/media/articles/xhs-hk-3day-itinerary/cover.png
```

Expected: seed 印出 `201 {"data":{"slug":"xhs-hk-3day-itinerary","created":true}}`；兩個 GET 回 JSON（`data.items` 含該文章、`data.image` 為完整 URL）；圖片 URL 回 200。

前端：起 `npm run dev:jikeyuan`（端口 5175），瀏覽器驗證：
1. `/guides` 列表顯示 4 張卡片（3 靜態 + 1 遠端；遠端 reviewedDate 最新排最前）
2. 點入 `/guides/xhs-hk-3day-itinerary` 詳情完整渲染（封面、段落、figure 圖、注意 callout、來源區）
3. 靜態攻略（如 `/guides/hong-kong-entry-timeline`）行為與之前完全一致
4. 停掉後端再刷新列表頁：靜態 3 篇仍在 + 頂部錯誤條出現；「重試」可恢復
5. 重跑 seed 兩次：列表仍只有 4 篇（upsert 生效）

- [ ] **Step 6: 全量測試 + 提交**

Run: `cd apps/api && .venv/bin/pytest -v` 與 `npm test -w @react-monorepo/jikeyuan`
Expected: 全綠

```bash
cd /Users/Admin/projects/react-monorepo
git add apps/jikeyuan/vercel.json .gitignore apps/api/scripts/seed_example.py apps/api/README.md
git commit -m "feat: seed script, api docs and vercel rewrite for dynamic guides"
```

---

## Self-Review 記錄

- **Spec 覆蓋**：§3 資料模型（T2）、§4 全部五個端點（T1 health／T4 寫入／T5 讀取）、§4 匯入契約含佔位符與限制（T4）、§5 存儲抽象（T3）、§6 前端各項（T6 模組／T7 列表合併與分頁／T8 詳情 fallback＋document.title／T9 vercel rewrite；noindex 由 `SeoMetadata` 對未知路徑的 fallback `indexable: false` 自動滿足）、§7 結構與啟動（T1＋T9 README）、§8 測試與驗收（各任務測試＋T9 全鏈路）、§9 上雲（T9 README「上雲」節）。
- **佔位符**：無 TBD；唯一的跨任務標記是 T4 中刻意註釋的兩行 `/api/guides` 斷言，T5 Step 5 明確還原。
- **型別一致性**：`fetchGuides`/`fetchGuideBySlug`/`RemoteGuidesPage`/`mergeGuides`/`to_article_out`/`import_article` 在定義與消費任務間簽名一致；`ArticleOut.path` 服務端計算，與前端 `Guide.path` 約定（`/guides/<slug>`）一致；`post_article(client, payload_overrides, files)` 在 T4 定義、T5 復用。
