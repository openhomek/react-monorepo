import { Lightbulb, WarningCircle } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

type GuideCalloutVariant = 'tip' | 'warning'

const calloutIcons: Record<GuideCalloutVariant, ReactNode> = {
  tip: <Lightbulb size={18} weight="fill" aria-hidden="true" className="text-primary" />,
  warning: <WarningCircle size={18} weight="fill" aria-hidden="true" className="text-primary" />,
}

const calloutSurfaces: Record<GuideCalloutVariant, string> = {
  tip: 'border-[#ffd6dd] bg-[#fff7f8]',
  warning: 'border-[#ffd6dd] bg-[#fff5f6]',
}

interface GuideCalloutProps {
  variant?: GuideCalloutVariant
  title?: string
  children: ReactNode
}

function GuideCallout({ variant = 'tip', title, children }: GuideCalloutProps) {
  return (
    <aside
      className={`mt-6 flex gap-2.5 rounded-[10px] border px-4 py-3.5 ${calloutSurfaces[variant]}`}
    >
      <span className="mt-0.5 shrink-0">{calloutIcons[variant]}</span>
      <div className="min-w-0">
        {title !== undefined && (
          <p className="text-[14px] font-semibold leading-6 text-[#222222]">{title}</p>
        )}
        <p className="text-[13.5px] leading-[1.8] text-[#3f3f3f]">{children}</p>
      </div>
    </aside>
  )
}

export default GuideCallout
