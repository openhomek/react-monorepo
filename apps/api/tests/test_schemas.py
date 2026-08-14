import pytest
from pydantic import ValidationError

from app.schemas import ArticleIn


def make_article() -> dict:
    return {
        "slug": "xhs-hk-3day-itinerary",
        "category": "交通出行",
        "title": "香港三天兩夜自由行攻略",
        "cardTitle": "香港三天兩夜自由行",
        "description": "尖沙咀、中環、太平山三日路線整理。",
        "publishedDate": "2026-08-13",
        "reviewedDate": "2026-08-14",
        "readingTime": "約 5 分鐘",
        "imageAlt": "香港三天兩夜路線圖",
        "image": "file:cover.jpg",
        "takeaways": ["第一天尖沙咀", "第二天中環", "第三天太平山"],
        "sections": [
            {
                "title": "Day 1 尖沙咀",
                "phase": "行程",
                "paragraphs": ["傍晚到尖沙咀海旁看夜景。"],
                "figures": [{"alt": "尖沙咀海旁", "caption": "尖沙咀海旁夜景", "image": "file:01.jpg"}],
            }
        ],
        "sources": [{"label": "原文", "organization": "小紅書", "url": "https://www.xiaohongshu.com/explore/xxx"}],
        "origin": {
            "platform": "xiaohongshu",
            "source_url": "https://www.xiaohongshu.com/explore/xxx",
            "author": "某博主",
        },
        "status": "published",
    }


def test_valid_article_parses() -> None:
    article = ArticleIn.model_validate(make_article())

    assert article.slug == "xhs-hk-3day-itinerary"
    assert article.sections[0].figures[0].image == "file:01.jpg"
    assert article.status == "published"


def test_slug_must_be_url_safe() -> None:
    payload = make_article()
    payload["slug"] = "Bad Slug!"

    with pytest.raises(ValidationError):
        ArticleIn.model_validate(payload)


def test_dates_must_be_iso_format() -> None:
    payload = make_article()
    payload["publishedDate"] = "2026/08/13"

    with pytest.raises(ValidationError):
        ArticleIn.model_validate(payload)


def test_status_defaults_to_draft() -> None:
    payload = make_article()
    del payload["status"]

    assert ArticleIn.model_validate(payload).status == "draft"


def test_origin_platform_is_limited() -> None:
    payload = make_article()
    payload["origin"]["platform"] = "tiktok"

    with pytest.raises(ValidationError):
        ArticleIn.model_validate(payload)
