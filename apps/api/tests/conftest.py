import os
import shutil

import pytest

os.environ.setdefault("MONGO_DB_NAME", "jikeyuan_api_test")
os.environ.setdefault("INGEST_API_KEY", "test-ingest-key")
os.environ.setdefault("MEDIA_ROOT", "media_test")
os.environ.setdefault("MEDIA_PUBLIC_BASE_URL", "http://testserver/media")

from app.config import get_settings  # noqa: E402

get_settings.cache_clear()


@pytest.fixture(autouse=True)
def clean_media_root():
    """本地存儲的測試文件逐測清空。"""
    yield
    shutil.rmtree(get_settings().media_root, ignore_errors=True)
