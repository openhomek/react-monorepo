import { Alert, AlertDescription, AlertTitle } from '@react-monorepo/ui'
import { Lightbulb, WarningCircle } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

type GuideCalloutVariant = 'tip' | 'warning'

const calloutIcons: Record<GuideCalloutVariant, ReactNode> = {
  tip: <Lightbulb weight="fill" aria-hidden="true" className="text-primary" />,
  warning: <WarningCircle weight="fill" aria-hidden="true" className="text-primary" />,
}

const calloutSurfaces: Record<GuideCalloutVariant, string> = {
  tip: 'border-[#ffd1d9] bg-[#fff7f8]',
  warning: 'border-primary/30 bg-[#fff5f6]',
}

interface GuideCalloutProps {
  variant?: GuideCalloutVariant
  title?: string
  children: ReactNode
}

function GuideCallout({ variant = 'tip', title, children }: GuideCalloutProps) {
  return (
    <Alert className={`mt-6 rounded-[14px] ${calloutSurfaces[variant]}`}>
      {calloutIcons[variant]}
      {title !== undefined && (
        <AlertTitle className="text-sm font-semibold text-[#222222]">{title}</AlertTitle>
      )}
      <AlertDescription className="text-sm leading-7 text-[#3f3f3f]">{children}</AlertDescription>
    </Alert>
  )
}

export default GuideCallout
