from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.db import ensure_indexes
from app.routers import admin, health


@asynccontextmanager
async def lifespan(_: FastAPI):
    await ensure_indexes()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="jikeyuan-api", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix="/api")
    app.include_router(admin.router, prefix="/api")

    if settings.storage_backend == "local":
        Path(settings.media_root).mkdir(parents=True, exist_ok=True)
        app.mount("/media", StaticFiles(directory=settings.media_root), name="media")

    return app


app = create_app()
