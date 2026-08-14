import { CheckCircle } from '@phosphor-icons/react'

import type { GuideSection as GuideSectionModel } from '../../content/guides'
import { categoryGlyphs } from './categoryGlyphs'
import GuideCallout from './GuideCallout'
import GuideFigure from './GuideFigure'
import GuideFlowSteps from './GuideFlowSteps'
import GuideTable from './GuideTable'

interface GuideSectionProps {
  section: GuideSectionModel
  index: number
  category: string
}

function GuideSection({ section, index, category }: GuideSectionProps) {
  const headingId = `guide-section-${index + 1}-heading`

  return (
    <section
      id={`guide-section-${index + 1}`}
      aria-labelledby={headingId}
      className="scroll-mt-[116px] min-[1128px]:scroll-mt-24"
    >
      <p className="flex items-baseline gap-2 text-xs font-bold tracking-[0.06em] text-[#6a6a6a]">
        <span className="text-sm font-bold text-primary tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
        {section.phase}
      </p>
      <h2
        id={headingId}
        className="mt-1.5 text-[22px] leading-[1.4] font-semibold tracking-[-0.01em] text-[#222222]"
      >
        {section.title}
      </h2>

      {section.paragraphs !== undefined && (
        <div className="mt-4 space-y-4">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-base leading-8 text-[#3f3f3f]">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {section.steps !== undefined && (
        <GuideFlowSteps steps={section.steps} label={`${section.title}流程`} />
      )}

      {section.table !== undefined && <GuideTable data={section.table} />}

      {section.checklist !== undefined && (
        <div className="mt-6 rounded-[14px] bg-[#f7f7f7] p-5 min-[744px]:p-6">
          <p className="text-xs font-bold tracking-[0.06em] text-[#6a6a6a]">檢查清單</p>
          <ul className="mt-3 space-y-3">
            {section.checklist.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-7 text-[#3f3f3f]">
                <CheckCircle
                  size={18}
                  weight="fill"
                  aria-hidden="true"
                  className="mt-[7px] shrink-0 text-primary"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {section.figures !== undefined && section.figures.length > 0 && (
        <div
          className={`mt-6 grid gap-4 ${
            section.figures.length > 1 ? 'min-[744px]:grid-cols-2' : ''
          }`}
        >
          {section.figures.map((figure, figureIndex) => (
            <GuideFigure
              key={figure.caption}
              figure={figure}
              index={figureIndex + 1}
              glyph={categoryGlyphs[category]}
            />
          ))}
        </div>
      )}

      {section.note !== undefined && (
        <GuideCallout variant="warning" title="注意">
          {section.note}
        </GuideCallout>
      )}
    </section>
  )
}

export default GuideSection
