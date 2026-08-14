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
