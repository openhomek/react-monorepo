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

    monkeypatch.setattr(get_settings(), "storage_backend", "s3")

    with pytest.raises(RuntimeError) as error:
        get_storage()

    assert "S3_ENDPOINT_URL" in str(error.value)
