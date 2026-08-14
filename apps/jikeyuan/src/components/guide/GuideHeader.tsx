import { BookOpen, Clock, SealCheck } from '@phosphor-icons/react'

import type { Guide } from '../../content/guides'

function GuideHeader({ guide }: { guide: Guide }) {
  return (
    <header className="mx-auto max-w-[1200px] px-6 pt-7 min-[744px]:px-8 min-[744px]:pt-9">
      <h1 className="max-w-[760px] text-[24px] leading-[1.3] font-bold tracking-[-0.02em] text-[#222222] min-[744px]:text-[28px]">
        {guide.title}
      </h1>
      <p className="mt-3 max-w-[720px] text-base leading-7 text-[#484848]">{guide.description}</p>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#6a6a6a]">
        <span className="inline-flex items-center gap-1.5">
          <SealCheck size={16} weight="regular" aria-hidden="true" className="text-primary" />
          最後核實 <time dateTime={guide.reviewedDate}>{guide.reviewedDate}</time>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock size={16} weight="regular" aria-hidden="true" />
          {guide.readingTime}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BookOpen size={16} weight="regular" aria-hidden="true" />
          有解編輯部整理
        </span>
      </div>
    </header>
  )
}

export default GuideHeader
