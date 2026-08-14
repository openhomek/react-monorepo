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
        # publishedDate 降冪；同值按 _id 升冪（插入順序），與 test_guides_api 分頁斷言一致
        .sort([("publishedDate", -1), ("_id", 1)])
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
