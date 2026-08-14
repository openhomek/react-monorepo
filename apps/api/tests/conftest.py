import os
import shutil

import motor.motor_asyncio
import pytest

os.environ.setdefault("MONGO_DB_NAME", "jikeyuan_api_test")
os.environ.setdefault("INGEST_API_KEY", "test-ingest-key")
os.environ.setdefault("MEDIA_ROOT", "media_test")
os.environ.setdefault("MEDIA_PUBLIC_BASE_URL", "http://testserver/media")

from app.config import get_settings  # noqa: E402

get_settings.cache_clear()


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


@pytest.fixture(autouse=True)
def reset_db_client():
    """TestClient 每個請求各建一個事件循環；逐測重置共享 Motor 客戶端，避免跨已關閉循環複用。"""
    import app.db as db_module

    db_module._client = None
    yield
    db_module._client = None


@pytest.fixture(autouse=True)
def clean_media_root():
    """本地存儲的測試文件逐測清空。"""
    yield
    shutil.rmtree(get_settings().media_root, ignore_errors=True)
