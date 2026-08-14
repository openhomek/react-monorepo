"""匯入一篇示例文章，用於本機全鏈路驗證。用法：.venv/bin/python scripts/seed_example.py"""

import asyncio
import base64
import json

import httpx

API_BASE = "http://localhost:8000/api"
API_KEY = "dev-ingest-key"

# 1x1 像素 PNG
PNG_1PX = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8BQDwAEBAF/6yL4AAAAAElFTkSuQmCC"
)

ARTICLE = {
    "slug": "xhs-hk-3day-itinerary",
    "category": "交通出行",
    "title": "香港三天兩夜自由行攻略（小紅書收錄）",
    "cardTitle": "香港三天兩夜自由行",
    "description": "尖沙咀、中環、太平山的三日路線與交通整理，來自小紅書博主實測。",
    "publishedDate": "2026-08-13",
    "reviewedDate": "2026-08-14",
    "readingTime": "約 5 分鐘",
    "imageAlt": "香港三天兩夜路線示意圖",
    "image": "file:cover.png",
    "takeaways": ["Day 1 尖沙咀夜景", "Day 2 中環＋山頂纜車", "Day 3 太平山＋返程"],
    "sections": [
        {
            "title": "Day 1：尖沙咀",
            "phase": "行程",
            "paragraphs": ["下午抵港後先去酒店寄存行李，傍晚到尖沙咀海旁看維港夜景。"],
            "figures": [
                {"alt": "尖沙咀海旁夜景", "caption": "尖沙咀海旁的維港夜景", "image": "file:day1.png"}
            ],
        },
        {
            "title": "Day 2：中環與山頂",
            "phase": "行程",
            "paragraphs": ["上午中環石板街、半山扶梯，下午搭山頂纜車上太平山。"],
            "note": "山頂纜車旺季排隊可達一小時，建議線上預購。",
        },
    ],
    "sources": [
        {"label": "原文", "organization": "小紅書", "url": "https://www.xiaohongshu.com/explore/example"}
    ],
    "origin": {
        "platform": "xiaohongshu",
        "source_url": "https://www.xiaohongshu.com/explore/example",
        "author": "示例博主",
    },
    "status": "published",
}


async def main() -> None:
    files = [
        ("images", ("cover.png", PNG_1PX, "image/png")),
        ("images", ("day1.png", PNG_1PX, "image/png")),
    ]
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{API_BASE}/admin/articles",
            headers={"X-API-Key": API_KEY},
            data={"article": json.dumps(ARTICLE)},
            files=files,
        )
        print(response.status_code, response.text)


if __name__ == "__main__":
    asyncio.run(main())
