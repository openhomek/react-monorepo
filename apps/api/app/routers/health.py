from fastapi import APIRouter

from app.db import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    await get_db().command("ping")
    return {"data": {"status": "ok"}}
