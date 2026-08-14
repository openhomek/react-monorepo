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
