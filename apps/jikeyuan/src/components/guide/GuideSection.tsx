import type { GuideSection as GuideSectionModel } from '../../content/guides'
import { categoryGlyphs } from './categoryGlyphs'
import GuideCallout from './GuideCallout'
import GuideFigure from './GuideFigure'
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
      className="scroll-mt-[116px] mt-11 first:mt-0 min-[744px]:mt-14 min-[1128px]:scroll-mt-24"
    >
      <h2
        id={headingId}
        className="text-[21px] leading-[1.35] font-semibold tracking-[-0.01em] text-[#222222] min-[744px]:text-[24px] min-[744px]:leading-[1.35]"
      >
        {section.title}
      </h2>

      {section.paragraphs !== undefined && (
        <div className="mt-4 space-y-3.5">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-[15px] leading-[1.9] text-[#3f3f3f] min-[744px]:text-base">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {section.checklist !== undefined && (
        <ul className="mt-4 space-y-2">
          {section.checklist.map((item) => (
            <li key={item} className="flex gap-2.5 text-[15px] leading-[1.9] text-[#3f3f3f] min-[744px]:text-base">
              <span
                aria-hidden="true"
                className="mt-[11px] size-[6px] shrink-0 rounded-full bg-primary"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {section.steps !== undefined && section.steps.length > 0 && (
        <ol className="mt-4" aria-label={`${section.title}步驟`}>
          {section.steps.map((step, stepIndex) => (
            <li
              key={step.title}
              className="border-b border-[#ebebeb] py-4 first:pt-1 last:border-0 last:pb-0"
            >
              <h3 className="flex items-baseline gap-2.5 text-[17px] leading-[1.35] font-semibold text-[#222222] min-[744px]:text-[19px] min-[744px]:leading-[1.35]">
                <span className="text-[13px] font-bold text-primary tabular-nums">
                  {String(stepIndex + 1).padStart(2, '0')}
                </span>
                {step.title}
              </h3>
              {step.paragraphs !== undefined && (
                <div className="mt-1.5 space-y-2.5">
                  {step.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-[15px] leading-[1.9] text-[#3f3f3f] min-[744px]:text-base">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      {section.table !== undefined && <GuideTable data={section.table} />}

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
