import { Clock, Notebook, SealCheck, Tag } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

import type { Guide } from '../../content/guides'

function GuideHeader({ guide }: { guide: Guide }) {
  return (
    <header className="mx-auto max-w-[1200px] px-6 pt-8 min-[744px]:px-8 min-[744px]:pt-10">
      <h1 className="max-w-[860px] text-[26px] leading-[1.35] font-bold tracking-[-0.01em] text-[#222222] min-[744px]:text-[32px]">
        {guide.title}
      </h1>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] leading-6 text-[#6a6a6a]">
        <Link
          to={`/guides?category=${encodeURIComponent(guide.category)}`}
          className="inline-flex items-center gap-1.5 font-semibold text-primary transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Tag size={15} weight="fill" aria-hidden="true" />
          {guide.category}
        </Link>
        <span className="inline-flex items-center gap-1.5">
          <SealCheck size={15} weight="fill" aria-hidden="true" className="text-primary" />
          最後核實 <time dateTime={guide.reviewedDate}>{guide.reviewedDate}</time>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock size={15} weight="regular" aria-hidden="true" />
          {guide.readingTime}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Notebook size={15} weight="regular" aria-hidden="true" />
          有解編輯部整理
        </span>
      </div>
    </header>
  )
}

export default GuideHeader
