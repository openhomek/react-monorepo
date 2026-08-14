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
