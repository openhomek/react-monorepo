import { ArrowSquareOut } from '@phosphor-icons/react'

import type { Guide } from '../../content/guides'

function GuideSources({ guide }: { guide: Guide }) {
  return (
    <section id="guide-sources" aria-labelledby="guide-sources-heading">
      <h2
        id="guide-sources-heading"
        className="text-[21px] leading-[1.35] font-semibold tracking-[-0.01em] text-[#222222] min-[744px]:text-[24px] min-[744px]:leading-[1.35]"
      >
        官方資料來源
      </h2>
      <p className="mt-2 text-[15px] leading-[1.8] text-[#6a6a6a]">
        政策、資格、費用和服務安排可能更新，辦理前請再次查閱以下官方頁面。
      </p>
      <ul className="mt-2 divide-y divide-[#ebebeb]">
        {guide.sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="min-w-0">
                <span className="block text-[15px] font-medium leading-6 text-primary group-hover:underline">
                  {source.label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-[#6a6a6a]">
                  {source.organization}
                </span>
              </span>
              <ArrowSquareOut
                size={16}
                weight="regular"
                aria-hidden="true"
                className="shrink-0 text-primary"
              />
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-5 rounded-[10px] bg-[#f7f7f7] px-4 py-3.5">
        <p className="text-[13px] leading-[1.8] text-[#6a6a6a]">
          本文提供一般資料整理，不構成法律、移民或財務意見。個人情況不同，應以主管部門、院校、服務機構或合資格專業人士的最新答覆為準。
        </p>
      </div>
    </section>
  )
}

export default GuideSources
