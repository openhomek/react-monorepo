"""文章模型。欄位名與前端 Guide 介面（apps/jikeyuan/src/content/guides.ts）逐一對應。"""

from typing import Literal

from pydantic import BaseModel, Field

DATE_PATTERN = r"^\d{4}-\d{2}-\d{2}$"


class GuideSource(BaseModel):
    label: str
    organization: str
    url: str


class GuideTableData(BaseModel):
    caption: str | None = None
    columns: list[str]
    rows: list[list[str]]


class GuideFigureData(BaseModel):
    alt: str
    caption: str
    # 匯入時為 "file:<文件名>" 佔位符，入庫後為存儲鍵，API 回傳時為完整 URL
    image: str | None = None


class GuideSection(BaseModel):
    title: str
    phase: str
    paragraphs: list[str] | None = None
    steps: list[str] | None = None
    table: GuideTableData | None = None
    figures: list[GuideFigureData] | None = None
    checklist: list[str] | None = None
    note: str | None = None


class GuideFaqItem(BaseModel):
    question: str
    answer: str


class ArticleOrigin(BaseModel):
    platform: Literal["xiaohongshu", "web"]
    source_url: str
    author: str | None = None
    scraped_at: str | None = None


class ArticleBase(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9-]+$")
    category: str
    title: str
    cardTitle: str
    description: str
    publishedDate: str = Field(pattern=DATE_PATTERN)
    reviewedDate: str = Field(pattern=DATE_PATTERN)
    readingTime: str
    imageAlt: str
    image: str | None = None
    featured: bool | None = None
    takeaways: list[str]
    sections: list[GuideSection]
    faq: list[GuideFaqItem] | None = None
    sources: list[GuideSource]


class ArticleIn(ArticleBase):
    origin: ArticleOrigin | None = None
    status: Literal["draft", "published"] = "draft"


class ArticleOut(ArticleBase):
    # 服務端計算，匯入方不需要填
    path: str
