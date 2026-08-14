import { CaretRight } from '@phosphor-icons/react'
import { Fragment } from 'react'

function GuideFlowSteps({ steps, label }: { steps: string[]; label: string }) {
  return (
    <ol
      aria-label={label}
      className="mt-6 flex flex-col gap-3 rounded-[14px] border border-[#dddddd] p-4 min-[744px]:flex-row min-[744px]:items-center min-[744px]:gap-2 min-[744px]:p-5"
    >
      {steps.map((step, index) => (
        <Fragment key={step}>
          <li className="flex flex-1 items-start gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#222222] text-xs font-bold text-white tabular-nums"
            >
              {index + 1}
            </span>
            <span className="text-sm leading-6 text-[#3f3f3f] min-[744px]:pt-0.5">{step}</span>
          </li>
          {index < steps.length - 1 && (
            <CaretRight
              size={14}
              weight="bold"
              aria-hidden="true"
              className="hidden shrink-0 self-center text-[#c1c1c1] min-[744px]:block"
            />
          )}
        </Fragment>
      ))}
    </ol>
  )
}

export default GuideFlowSteps
