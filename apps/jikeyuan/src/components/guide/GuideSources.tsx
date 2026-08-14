import { ArrowSquareOut } from '@phosphor-icons/react'

import type { Guide } from '../../content/guides'

function GuideSources({ guide }: { guide: Guide }) {
  return (
    <section aria-labelledby="guide-sources-heading">
      <h2 id="guide-sources-heading" className="text-[22px] leading-9 font-semibold text-[#222222]">
        官方資料來源
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#6a6a6a]">
        政策、資格、費用和服務安排可能更新，辦理前請再次查閱以下官方頁面。
      </p>
      <ul className="mt-5 grid gap-3 min-[744px]:grid-cols-2">
        {guide.sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="flex h-full items-start justify-between gap-4 rounded-[14px] border border-[#dddddd] p-4 transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span>
                <span className="block text-sm font-semibold">{source.label}</span>
                <span className="mt-1 block text-xs text-[#6a6a6a]">{source.organization}</span>
              </span>
              <ArrowSquareOut size={16} weight="regular" aria-hidden="true" className="mt-0.5 shrink-0" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-6 rounded-[14px] bg-[#f7f7f7] px-5 py-4 text-xs leading-6 text-[#6a6a6a]">
        本文提供一般資料整理，不構成法律、移民或財務意見。個人情況不同，應以主管部門、院校、服務機構或合資格專業人士的最新答覆為準。
      </p>
    </section>
  )
}

export default GuideSources
