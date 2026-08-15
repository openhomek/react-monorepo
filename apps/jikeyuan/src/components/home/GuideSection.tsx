import { Badge } from '@react-monorepo/ui'
import { ArrowRight, BookOpenText, SealCheck } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchGuides } from '../../apis/guides'
import { type Guide, guides } from '../../content/guides'

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-[#dddddd] bg-white transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_30px_rgba(34,34,34,0.08)]">
      <Link
        to={guide.path}
        className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {guide.image !== undefined ? (
          <img
            src={guide.image}
            alt={guide.imageAlt}
            loading="lazy"
            decoding="async"
            className="aspect-[1.9/1] w-full object-cover"
          />
        ) : (
          <div
            className="flex aspect-[1.9/1] items-center justify-center bg-[#fff7f8] text-primary"
            role="img"
            aria-label={guide.imageAlt}
          >
            <BookOpenText size={40} weight="duotone" aria-hidden="true" />
          </div>
        )}

        <div className="flex min-h-[198px] flex-col p-4">
          <Badge
            variant="secondary"
            className="mb-3 w-fit rounded-md bg-[#fff0f2] text-[11px] font-semibold text-primary"
          >
            {guide.category}
          </Badge>
          <h3 className="text-base leading-6 font-semibold text-[#222222] group-hover:text-primary">
            {guide.cardTitle}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#717171]">
            {guide.description}
          </p>

          <div className="mt-auto flex items-center justify-between gap-4 pt-4 text-xs text-[#717171]">
            <time className="inline-flex items-center gap-2" dateTime={guide.reviewedDate}>
              <SealCheck size={14} weight="regular" aria-hidden="true" className="text-primary" />
              最後核實 {guide.reviewedDate}
            </time>
            <span className="inline-flex items-center gap-1 font-semibold text-primary">
              閱讀
              <ArrowRight
                size={16}
                weight="regular"
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

function GuideSection() {
  const [latestGuides, setLatestGuides] = useState<Guide[] | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const result = await fetchGuides({ page: 1, page_size: 3 })
        if (!cancelled && result.items.length > 0) {
          setLatestGuides(result.items)
        }
      } catch {
        // 後端不可用時沿用官撰攻略
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const shown = latestGuides ?? guides

  return (
    <section
      id="guides"
      className="scroll-mt-24 bg-white pb-2"
      aria-labelledby="guides-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 min-[744px]:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="guides-heading" className="text-xl font-bold sm:text-2xl">
              新生熱門攻略
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#717171]">
              以香港官方資料核實，按實際辦理次序整理入境、租屋和交通重點。
            </p>
          </div>
          <Link
            to="/guides"
            className="mb-0.5 inline-flex shrink-0 items-center gap-1 rounded-lg text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            查看全部攻略
            <ArrowRight size={16} weight="regular" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 min-[744px]:grid-cols-3">
          {shown.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default GuideSection
