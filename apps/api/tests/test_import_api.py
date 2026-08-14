import json

from fastapi.testclient import TestClient

from tests.test_schemas import make_article

API_KEY_HEADERS = {"X-API-Key": "test-ingest-key"}


def post_article(
    client: TestClient,
    payload_overrides: dict | None = None,
    files: list | None = None,
):
    payload = make_article()
    if payload_overrides:
        payload.update(payload_overrides)
    default_files = [
        ("images", ("cover.jpg", b"cover-bytes", "image/jpeg")),
        ("images", ("01.jpg", b"figure-bytes", "image/jpeg")),
    ]
    return client.post(
        "/api/admin/articles",
        headers=API_KEY_HEADERS,
        data={"article": json.dumps(payload)},
        files=default_files if files is None else files,
    )


def test_import_creates_article(client: TestClient) -> None:
    response = post_article(client)

    assert response.status_code == 201
    assert response.json() == {"data": {"slug": "xhs-hk-3day-itinerary", "created": True}}


def test_import_same_slug_updates_not_duplicates(client: TestClient) -> None:
    post_article(client)
    response = post_article(client, payload_overrides={"title": "更新後標題"})

    assert response.status_code == 200
    assert response.json()["data"]["created"] is False
    # TODO(Task 5): 打開以下兩行（/api/guides 在 Task 5 落地）
    # list_response = client.get("/api/guides")
    # assert list_response.json()["data"]["total"] == 1


def test_import_rejects_missing_api_key(client: TestClient) -> None:
    response = client.post(
        "/api/admin/articles",
        data={"article": json.dumps(make_article())},
        files=[("images", ("cover.jpg", b"x", "image/jpeg"))],
    )

    assert response.status_code == 401


def test_import_rejects_wrong_api_key(client: TestClient) -> None:
    response = client.post(
        "/api/admin/articles",
        headers={"X-API-Key": "wrong"},
        data={"article": json.dumps(make_article())},
        files=[("images", ("cover.jpg", b"x", "image/jpeg"))],
    )

    assert response.status_code == 401


def test_import_rejects_bad_json(client: TestClient) -> None:
    response = client.post(
        "/api/admin/articles",
        headers=API_KEY_HEADERS,
        data={"article": "{not json"},
        files=[],
    )

    assert response.status_code == 422


def test_import_rejects_missing_image_file(client: TestClient) -> None:
    response = post_article(client, files=[("images", ("cover.jpg", b"cover", "image/jpeg"))])

    assert response.status_code == 422
    assert "01.jpg" in response.text


def test_import_rejects_unreferenced_image_file(client: TestClient) -> None:
    extra = [
        ("images", ("cover.jpg", b"a", "image/jpeg")),
        ("images", ("01.jpg", b"b", "image/jpeg")),
        ("images", ("02.jpg", b"c", "image/jpeg")),
    ]

    response = post_article(client, files=extra)

    assert response.status_code == 422
    assert "02.jpg" in response.text


def test_import_rejects_path_traversal_filename(client: TestClient) -> None:
    payload = make_article()
    payload["image"] = "file:../evil.jpg"

    response = client.post(
        "/api/admin/articles",
        headers=API_KEY_HEADERS,
        data={"article": json.dumps(payload)},
        files=[("images", ("../evil.jpg", b"x", "image/jpeg"))],
    )

    assert response.status_code == 422


def test_import_rejects_more_than_20_images(client: TestClient) -> None:
    payload = make_article()
    figures = [{"alt": f"圖{i}", "caption": f"圖{i}", "image": f"file:{i:02d}.jpg"} for i in range(21)]
    payload["sections"][0]["figures"] = figures

    response = client.post(
        "/api/admin/articles",
        headers=API_KEY_HEADERS,
        data={"article": json.dumps(payload)},
        files=[("images", (f"{i:02d}.jpg", b"x", "image/jpeg")) for i in range(21)],
    )

    assert response.status_code == 422


def test_import_stores_images_with_storage_keys(client: TestClient) -> None:
    post_article(client)

    from pathlib import Path

    from app.config import get_settings

    media_root = Path(get_settings().media_root)
    assert (media_root / "articles" / "xhs-hk-3day-itinerary" / "cover.jpg").read_bytes() == b"cover-bytes"
    assert (media_root / "articles" / "xhs-hk-3day-itinerary" / "01.jpg").exists()


def test_delete_removes_article_and_images(client: TestClient) -> None:
    post_article(client)

    response = client.delete("/api/admin/articles/xhs-hk-3day-itinerary", headers=API_KEY_HEADERS)

    assert response.status_code == 200
    assert (
        client.delete("/api/admin/articles/xhs-hk-3day-itinerary", headers=API_KEY_HEADERS).status_code
        == 404
    )
