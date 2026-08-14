from fastapi.testclient import TestClient

from tests.test_import_api import post_article


def seed(client: TestClient, overrides: dict | None = None, files: list | None = None) -> None:
    post_article(client, payload_overrides=overrides, files=files)


def test_list_returns_published_articles_with_urls(client: TestClient) -> None:
    seed(client)

    response = client.get("/api/guides")

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["total"] == 1
    assert data["page"] == 1
    assert data["page_size"] == 20
    guide = data["items"][0]
    assert guide["slug"] == "xhs-hk-3day-itinerary"
    assert guide["path"] == "/guides/xhs-hk-3day-itinerary"
    assert guide["image"] == "http://testserver/media/articles/xhs-hk-3day-itinerary/cover.jpg"
    assert guide["sections"][0]["figures"][0]["image"].endswith("/articles/xhs-hk-3day-itinerary/01.jpg")
    assert "status" not in guide
    assert "origin" not in guide


def test_list_hides_drafts(client: TestClient) -> None:
    seed(client, {"status": "draft"})

    response = client.get("/api/guides")

    assert response.json()["data"]["total"] == 0


def test_list_filters_by_category(client: TestClient) -> None:
    seed(client)
    seed(
        client,
        {
            "slug": "second-article",
            "category": "租房住宿",
            "image": None,
            "sections": [{"title": "段落", "phase": "行程", "paragraphs": ["x"]}],
        },
        files=[],
    )

    response = client.get("/api/guides", params={"category": "租房住宿"})

    data = response.json()["data"]
    assert data["total"] == 1
    assert data["items"][0]["slug"] == "second-article"


def test_list_searches_title_and_description(client: TestClient) -> None:
    seed(client)

    assert client.get("/api/guides", params={"q": "自由行"}).json()["data"]["total"] == 1
    assert client.get("/api/guides", params={"q": "不存在的詞"}).json()["data"]["total"] == 0


def test_list_paginates(client: TestClient) -> None:
    for index in range(3):
        seed(
            client,
            {
                "slug": f"article-{index}",
                "image": None,
                "sections": [{"title": "段落", "phase": "行程", "paragraphs": ["x"]}],
            },
            files=[],
        )

    page_one = client.get("/api/guides", params={"page": 1, "page_size": 2}).json()["data"]
    page_two = client.get("/api/guides", params={"page": 2, "page_size": 2}).json()["data"]

    assert page_one["total"] == 3
    assert [item["slug"] for item in page_one["items"]] == ["article-0", "article-1"]
    assert [item["slug"] for item in page_two["items"]] == ["article-2"]


def test_detail_returns_article(client: TestClient) -> None:
    seed(client)

    response = client.get("/api/guides/xhs-hk-3day-itinerary")

    assert response.status_code == 200
    assert response.json()["data"]["cardTitle"] == "香港三天兩夜自由行"


def test_detail_404_for_unknown_slug(client: TestClient) -> None:
    assert client.get("/api/guides/no-such-slug").status_code == 404


def test_detail_404_for_draft(client: TestClient) -> None:
    seed(client, {"status": "draft"})

    assert client.get("/api/guides/xhs-hk-3day-itinerary").status_code == 404
