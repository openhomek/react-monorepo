import secrets
from json import JSONDecodeError
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.config import get_settings
from app.db import get_db
from app.schemas import ArticleIn
from app.services.import_service import MAX_FILE_BYTES, import_article
from app.storage import get_storage

router = APIRouter(tags=["admin"])


async def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    expected = get_settings().ingest_api_key
    # bytes 比較：非 ASCII 的 X-API-Key 會讓 str 版 compare_digest 拋 TypeError → 500
    if x_api_key is None or not secrets.compare_digest(
        x_api_key.encode("utf-8"), expected.encode("utf-8")
    ):
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
