import { DownloadSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'

import type { GuidePromo } from '../../content/guides'

function GuidePromoBanner({ promo }: { promo: GuidePromo }) {
  function handleDownload(): void {
    toast('檢查清單準備中', {
      description: '清單推出後會在這裡開放下載，敬請期待。',
    })
  }

  return (
    <aside
      aria-label={promo.title}
      className="mt-12 overflow-hidden rounded-[10px] bg-primary min-[744px]:mt-14"
    >
      <div className="flex items-stretch">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-6 py-6 min-[744px]:gap-2 min-[744px]:px-8 min-[744px]:py-7">
          <p className="text-[17px] font-bold leading-7 text-white min-[744px]:text-lg">
            {promo.title}
          </p>
          <p className="text-[13px] leading-6 text-white/85">{promo.subtitle}</p>
          <div className="mt-2.5">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex h-10 items-center gap-1.5 rounded-[6px] bg-white px-4 text-[13px] font-bold text-primary transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <DownloadSimple size={16} weight="bold" aria-hidden="true" />
              {promo.actionLabel}
            </button>
          </div>
        </div>
        <div className="relative hidden w-[38%] shrink-0 sm:block">
          <img
            src={promo.image}
            alt="香港住宅室內環境"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/25 mix-blend-multiply" aria-hidden="true" />
        </div>
      </div>
    </aside>
  )
}

export default GuidePromoBanner
