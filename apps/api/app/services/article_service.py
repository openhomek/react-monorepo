from app.schemas import ArticleOut
from app.storage import StorageBackend


def to_article_out(document: dict, storage: StorageBackend) -> ArticleOut:
    document = dict(document)
    document["path"] = f"/guides/{document['slug']}"
    if document.get("image") is not None:
        document["image"] = storage.url_for(document["image"])
    for section in document.get("sections", []):
        for figure in section.get("figures") or []:
            if figure.get("image") is not None:
                figure["image"] = storage.url_for(figure["image"])
    return ArticleOut.model_validate(document)
