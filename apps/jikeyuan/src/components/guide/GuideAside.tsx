import { FacebookLogo, Link, SealCheck, Star, WhatsappLogo } from '@phosphor-icons/react'
import { useEffect, useId, useState } from 'react'
import { toast } from 'sonner'

import logo from '../../assets/logo.svg'
import type { Guide } from '../../content/guides'

export interface GuideTocItem {
  id: string
  title: string
}

function scrollToSection(id: string): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  document.getElementById(id)?.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start',
  })
}

function useActiveSection(items: GuideTocItem[]): string {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null)

    if (sections.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [items])

  return activeId
}

export function GuideEditorCard({ className = '' }: { className?: string }) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className={className}>
      <div className="rounded-[10px] bg-[#FEF0F2] p-4">
        <div className="relative mx-auto w-fit">
          <span className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-[#FF3348]">
            <img src={logo} alt="" aria-hidden="true" className="h-8 w-auto max-w-none" />
          </span>
          <span className="absolute -bottom-1 -right-1 flex size-[22px] items-center justify-center rounded-full bg-primary text-white ring-2 ring-[#FEF0F2]">
            <SealCheck size={13} weight="fill" aria-hidden="true" />
          </span>
        </div>
        <h2 id={headingId} className="mt-3 text-base leading-[1.5] font-bold text-[#222222]">
          有解編輯部
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-[1.5] text-[#6a6a6a]">
          專門為香港新生整理生活實用攻略。每篇內容都對照官方資料核實，並標示最後核實日期，幫你避開過期資訊。
        </p>
      </div>
    </section>
  )
}

export function GuideRating({ guide, className = '' }: { guide: Guide; className?: string }) {
  const headingId = useId()
  const [rating, setRating] = useState<number | null>(() => {
    try {
      const stored = window.localStorage.getItem(`jikeyuan:guide-rating:${guide.slug}`)
      const parsed = stored === null ? Number.NaN : Number.parseInt(stored, 10)
      return parsed >= 1 && parsed <= 5 ? parsed : null
    } catch {
      return null
    }
  })
  const [preview, setPreview] = useState(0)

  function handleRate(value: number): void {
    const isFirstRating = rating === null

    setRating(value)

    try {
      window.localStorage.setItem(`jikeyuan:guide-rating:${guide.slug}`, String(value))
    } catch {
      // 無法寫入 localStorage 時只更新介面狀態。
    }

    if (isFirstRating) {
      toast('多謝你的評分')
    }
  }

  const shownStars = preview || rating || 0

  return (
    <section aria-labelledby={headingId} className={className}>
      <h2 id={headingId} className="text-[15px] leading-[1.5] font-bold text-[#222222]">
        這篇攻略有多有用？
      </h2>
      <div
        role="radiogroup"
        aria-label="攻略評分（1 至 5 星）"
        className="mt-2.5 flex gap-1"
        onMouseLeave={() => setPreview(0)}
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const active = shownStars >= value

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} 星`}
              onMouseEnter={() => setPreview(value)}
              onFocus={() => setPreview(value)}
              onBlur={() => setPreview(0)}
              onClick={() => handleRate(value)}
              className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Star
                size={24}
                weight={active ? 'fill' : 'regular'}
                aria-hidden="true"
                className={active ? 'text-primary' : 'text-[#d5d5d5]'}
              />
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-xs leading-5 text-[#6a6a6a]" aria-live="polite">
        {rating === null ? '成為第一個為這篇攻略評分的人' : '多謝你的評分'}
      </p>
    </section>
  )
}

export function GuideShare({ guide, className = '' }: { guide: Guide; className?: string }) {
  const headingId = useId()

  function openFacebook(): void {
    const url = encodeURIComponent(window.location.href)
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'noopener,noreferrer,width=640,height=580',
    )
  }

  function openWhatsApp(): void {
    const text = encodeURIComponent(`${guide.title}\n${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  async function copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast('已複製攻略連結')
    } catch {
      toast('複製不到連結', { description: '請直接複製瀏覽器網址列的網址。' })
    }
  }

  const buttonBase =
    'flex size-10 items-center justify-center rounded-full text-white transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

  return (
    <section aria-labelledby={headingId} className={className}>
      <h2 id={headingId} className="text-[15px] leading-[1.5] font-bold text-[#222222]">
        分享
      </h2>
      <div className="mt-2.5 flex gap-2.5">
        <button
          type="button"
          onClick={openFacebook}
          aria-label="分享到 Facebook"
          className={`${buttonBase} bg-[#1877F2]`}
        >
          <FacebookLogo size={20} weight="fill" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={openWhatsApp}
          aria-label="分享到 WhatsApp"
          className={`${buttonBase} bg-[#25D366]`}
        >
          <WhatsappLogo size={20} weight="fill" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => void copyLink()}
          aria-label="複製攻略連結"
          className={`${buttonBase} bg-[#222222]`}
        >
          <Link size={20} weight="regular" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

function GuideAside({ items, guide }: { items: GuideTocItem[]; guide: Guide }) {
  const activeId = useActiveSection(items)

  if (items.length === 0) {
    return null
  }

  return (
    <>
      {/* 桌面：左側目錄欄（含編輯部卡、評分與分享） */}
      <div className="hidden min-[1128px]:block">
        <div className="sticky top-[88px] w-full space-y-5 pt-1">
          <nav aria-label="攻略目錄">
            <p className="text-[13px] font-bold tracking-[0.02em] text-[#222222]">目錄</p>
            <ul className="mt-3 space-y-0.5">
              {items.map((item) => {
                const active = item.id === activeId

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-current={active ? 'true' : undefined}
                      onClick={() => scrollToSection(item.id)}
                      className={`-ml-0.5 w-full border-l-2 py-1.5 pl-3 text-left text-[13px]! leading-[1.5] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        active
                          ? 'border-primary font-semibold text-[#222222]'
                          : 'border-transparent text-[#6a6a6a] hover:border-[#dddddd] hover:text-[#222222]'
                      }`}
                    >
                      {item.title}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="border-t border-[#ebebeb] pt-5">
            <GuideEditorCard />
          </div>

          <div className="border-t border-[#ebebeb] pt-5">
            <GuideRating guide={guide} />
          </div>

          <div className="border-t border-[#ebebeb] pt-5">
            <GuideShare guide={guide} />
          </div>
        </div>
      </div>
    </>
  )
}

export default GuideAside
