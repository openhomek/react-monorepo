import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import logoUrl from '../../assets/logo.svg'
import { fetchGuides, type RemoteGuidesPage } from '../../apis/guides'
import { categoryGlyphs } from './categoryGlyphs'
import { type Guide, guides, type GuideRelatedCard } from '../../content/guides'

function RelatedCardCover({ card }: { card: GuideRelatedCard }) {
  if (card.image !== undefined) {
    return (
      <img
        src={card.image}
        alt={card.imageAlt}
        loading="lazy"
        decoding="async"
        className="block size-full object-cover"
      />
    )
  }

  const glyph = categoryGlyphs[card.category]

  return (
    <div role="img" aria-label={card.imageAlt} className="flex size-full items-center justify-center bg-[#f7f7f7]">
      <span className="flex size-16 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(34,34,34,0.06)]">
        {glyph !== undefined && (
          <img src={glyph} alt="" aria-hidden="true" className="size-8 object-contain" draggable="false" />
        )}
      </span>
    </div>
  )
}

function RelatedCard({ card }: { card: GuideRelatedCard }) {
  const author = card.author ?? '有解編輯部'

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-[15px] bg-white transition-[transform,box-shadow] duration-[180ms] hover:-translate-y-0.5"
      style={{
        boxShadow:
          '0 2px 4px rgba(0, 0, 0, 0.025), 0 8px 18px rgba(0, 0, 0, 0.055)',
      }}
    >
      <Link
        to={card.href}
        aria-label={`閱讀攻略：${card.title}`}
        className="block aspect-[1.88/1] shrink-0 overflow-hidden bg-[#f7f7f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <RelatedCardCover card={card} />
      </Link>
      <div className="flex flex-1 flex-col px-5 pt-[19px] pb-[18px]">
        <Link
          to={`/guides?category=${encodeURIComponent(card.category)}`}
          className="inline-flex h-6 items-center self-start rounded px-[11px] text-xs font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          style={{ backgroundColor: '#fff0f2' }}
        >
          {card.category}
        </Link>
        <h3 className="mt-2.5 min-h-[44px] text-base leading-[22px] font-bold text-[#202735]">
          <Link
            to={card.href}
            className="line-clamp-2 transition-colors group-hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {card.title}
          </Link>
        </h3>
        {card.description !== undefined && (
          <p className="mt-1.5 line-clamp-2 h-[46px] text-sm leading-[23px] text-[#6c6c6c]">{card.description}</p>
        )}
        <div className="mt-auto flex min-w-0 items-center gap-2 whitespace-nowrap pt-3 text-xs text-[#717171]">
          <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FF3348]">
            <img alt="" aria-hidden="true" className="h-3 w-auto max-w-none" src={logoUrl} />
          </span>
          <span className="truncate">
            {author} · <time dateTime={card.publishedDate ?? card.reviewedDate}>{card.publishedDate ?? card.reviewedDate}</time>
          </span>
        </div>
      </div>
    </article>
  )
}

function toCard(article: RemoteGuidesPage['items'][number]): GuideRelatedCard {
  return {
    title: article.cardTitle,
    category: article.category,
    href: article.path,
    image: article.image,
    imageAlt: article.imageAlt,
    reviewedDate: article.reviewedDate,
    readingTime: article.readingTime,
    publishedDate: article.publishedDate,
    description: article.description,
    author: (article as { author?: string }).author,
  }
}

function staticFallback(excludeSlug: string): GuideRelatedCard[] {
  return guides
    .filter((item) => item.slug !== excludeSlug)
    .map((item) => ({
      title: item.cardTitle,
      category: item.category,
      href: item.path,
      image: item.image,
      imageAlt: item.imageAlt,
      reviewedDate: item.reviewedDate,
      readingTime: item.readingTime,
      publishedDate: item.publishedDate,
    }))
}

function RelatedGuides({ guide }: { guide: Guide }) {
  const [cards, setCards] = useState<GuideRelatedCard[] | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const sameCategory = await fetchGuides({ category: guide.category, page: 1, page_size: 5 })
        let items = sameCategory.items.filter((item) => item.slug !== guide.slug)
        if (items.length < 4) {
          const latest = await fetchGuides({ page: 1, page_size: 8 })
          const seen = new Set([guide.slug, ...items.map((item) => item.slug)])
          items = [...items, ...latest.items.filter((item) => !seen.has(item.slug))]
        }
        if (!cancelled) {
          setCards(items.slice(0, 4).map(toCard))
        }
      } catch {
        if (!cancelled) {
          setCards(staticFallback(guide.slug))
        }
      }
    }

    setCards(null)
    void load()
    return () => {
      cancelled = true
    }
  }, [guide.slug, guide.category])

  if (cards === null || cards.length === 0) {
    return null
  }

  return (
    <aside aria-labelledby="related-guides-heading" className="border-t border-[#ebebeb] bg-[#fafafa]">
      <div className="mx-auto max-w-[1132px] px-4 py-10 min-[744px]:px-4 min-[744px]:py-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="related-guides-heading" className="text-[20px] leading-7 font-bold text-[#111111]">
            相關攻略
          </h2>
          <Link to="/guides" className="text-sm font-semibold text-primary hover:underline">
            查看全部攻略
          </Link>
        </div>
        <div className="mt-2.5 grid grid-cols-1 gap-4 min-[768px]:grid-cols-2 min-[768px]:gap-6 min-[1200px]:grid-cols-4">
          {cards.map((card) => (
            <RelatedCard key={`${card.href}-${card.title}`} card={card} />
          ))}
        </div>
      </div>
    </aside>
  )
}

export default RelatedGuides
