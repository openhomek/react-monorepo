import { Badge } from '@react-monorepo/ui'
import { ArrowRight, BookOpenText, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'

import { type Guide, guides } from '../../content/guides'

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-[#dddddd] bg-white transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_30px_rgba(34,34,34,0.08)]">
      <Link to={guide.path} className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <div
          className="flex aspect-[16/7] items-center justify-center bg-[#fff7f8] text-primary"
          role="img"
          aria-label={guide.imageAlt}
        >
          <BookOpenText className="size-10" strokeWidth={1.5} aria-hidden="true" />
        </div>

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
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#666666]">
            {guide.description}
          </p>

          <div className="mt-auto flex items-center justify-between gap-4 pt-4 text-xs text-[#777777]">
            <time className="inline-flex items-center gap-2" dateTime={guide.reviewedDate}>
              <CalendarDays className="size-4" />
              {guide.reviewedDate}
            </time>
            <span className="inline-flex items-center gap-1 font-semibold text-primary">
              閱讀
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

function GuideSection() {
  return (
    <section
      id="guides"
      className="scroll-mt-24 bg-white pb-2"
      aria-labelledby="guides-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 min-[744px]:px-8">
        <div>
          <h2 id="guides-heading" className="text-xl font-bold sm:text-2xl">
            新生熱門攻略
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666666]">
            以香港官方資料核實，按實際辦理次序整理入境、租屋和交通重點。
          </p>
        </div>

        <div className="mt-5 grid gap-4 min-[744px]:grid-cols-3">
          {guides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default GuideSection
