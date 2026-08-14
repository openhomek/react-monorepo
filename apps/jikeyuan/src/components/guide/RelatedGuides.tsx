import { ArrowRight, SealCheck } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

import type { Guide } from '../../content/guides'

function RelatedGuides({ items }: { items: Guide[] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <aside aria-labelledby="related-guides-heading" className="border-t border-[#ebebeb]">
      <div className="mx-auto max-w-[1200px] px-6 py-10 min-[744px]:px-8 min-[744px]:py-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="related-guides-heading" className="text-[22px] leading-9 font-semibold text-[#222222]">
            接著閱讀
          </h2>
          <Link to="/guides" className="text-sm font-semibold text-primary hover:underline">
            查看全部攻略
          </Link>
        </div>
        <div className="mt-5 grid gap-4 min-[744px]:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.slug}
              to={item.path}
              className="group flex flex-col rounded-[14px] border border-[#dddddd] bg-white p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="text-xs font-semibold text-primary">{item.category}</span>
              <h3 className="mt-2 text-base leading-7 font-semibold text-[#222222] group-hover:text-primary">
                {item.cardTitle}
              </h3>
              <span className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-[#6a6a6a]">
                <SealCheck size={14} weight="regular" aria-hidden="true" className="text-primary" />
                最後核實 {item.reviewedDate}
                <span aria-hidden="true">·</span>
                {item.readingTime}
              </span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                閱讀攻略
                <ArrowRight
                  size={16}
                  weight="regular"
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default RelatedGuides
