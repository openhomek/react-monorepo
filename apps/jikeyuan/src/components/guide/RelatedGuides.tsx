import { Clock, SealCheck } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchGuides, type RemoteGuidesPage } from '../../apis/guides'
import { categoryGlyphs } from './categoryGlyphs'
import { type Guide, guides, type GuideRelatedCard } from '../../content/guides'

function RelatedCardImage({ card }: { card: GuideRelatedCard }) {
  if (card.image !== undefined) {
    return (
      <img
        src={card.image}
        alt={card.imageAlt}
        loading="lazy"
        decoding="async"
        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    )
  }

  const glyph = categoryGlyphs[card.category]

  return (
    <div role="img" aria-label={card.imageAlt} className="flex size-full items-center justify-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(34,34,34,0.06)]">
        {glyph !== undefined && (
          <img src={glyph} alt="" aria-hidden="true" className="size-8 object-contain" draggable="false" />
        )}
      </span>
    </div>
  )
}

function RelatedCard({ card }: { card: GuideRelatedCard }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[10px] border border-[#dddddd] bg-white transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-[0_6px_16px_rgba(34,34,34,0.06)]">
      <Link
        to={card.href}
        aria-label={`閱讀攻略：${card.title}`}
        className="block aspect-[1.9/1] overflow-hidden bg-[#f7f7f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <RelatedCardImage card={card} />
      </Link>
      <div className="flex flex-1 flex-col p-3.5">
        <Link
          to={`/guides?category=${encodeURIComponent(card.category)}`}
          className="w-fit text-xs font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {card.category}
        </Link>
        <h3 className="mt-1.5 text-[15px] leading-6 font-semibold text-[#222222]">
          <Link
            to={card.href}
            className="line-clamp-2 transition-colors group-hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {card.title}
          </Link>
        </h3>
        {card.description !== undefined && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-[#6a6a6a]">{card.description}</p>
        )}
        <span className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-[#6a6a6a]">
          <span className="truncate font-medium text-[#3f3f3f]">{card.author ?? '有解編輯部'}</span>
          <span aria-hidden="true">·</span>
          <SealCheck size={13} weight="regular" aria-hidden="true" className="shrink-0 text-primary" />
          {card.reviewedDate}
          <span aria-hidden="true">·</span>
          <Clock size={13} weight="regular" aria-hidden="true" className="shrink-0" />
          {card.readingTime}
        </span>
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
    <aside aria-labelledby="related-guides-heading" className="border-t border-[#ebebeb]">
      <div className="mx-auto max-w-[1200px] px-6 py-10 min-[744px]:px-8 min-[744px]:py-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="related-guides-heading" className="text-[21px] leading-[1.35] font-semibold tracking-[-0.01em] text-[#222222] min-[744px]:text-[24px] min-[744px]:leading-[1.35]">
            相關攻略
          </h2>
          <Link to="/guides" className="text-sm font-semibold text-primary hover:underline">
            查看全部攻略
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 min-[1128px]:grid-cols-4">
          {cards.map((card) => (
            <RelatedCard key={`${card.href}-${card.title}`} card={card} />
          ))}
        </div>
      </div>
    </aside>
  )
}

export default RelatedGuides
