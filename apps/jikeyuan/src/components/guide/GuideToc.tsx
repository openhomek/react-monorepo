import { List } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

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

function GuideToc({ items }: { items: GuideTocItem[] }) {
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

  if (items.length === 0) {
    return null
  }

  return (
    <>
      <aside aria-label="文章目錄" className="hidden min-[1128px]:block">
        <div className="sticky top-[88px]">
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-[#6a6a6a]">
            <List size={14} weight="bold" aria-hidden="true" />
            內容目錄
          </p>
          <ol className="mt-3 border-l border-[#ebebeb]">
            {items.map((item, index) => {
              const active = item.id === activeId

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={active ? 'true' : undefined}
                    onClick={() => scrollToSection(item.id)}
                    className={`-ml-px flex w-full items-baseline gap-2 border-l-2 py-1.5 pl-3 pr-2 text-left text-[13px] leading-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      active
                        ? 'border-primary font-semibold text-primary'
                        : 'border-transparent text-[#484848] hover:border-[#dddddd] hover:text-[#222222]'
                    }`}
                  >
                    <span
                      className={`shrink-0 text-xs font-bold tabular-nums ${
                        active ? 'text-primary' : 'text-[#929292]'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">{item.title}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </aside>

      <nav
        aria-label="文章目錄"
        className="horizontal-scroll sticky top-16 z-20 -mx-6 border-b border-[#ebebeb] bg-white/95 px-6 py-2.5 backdrop-blur min-[744px]:-mx-8 min-[744px]:px-8 min-[1128px]:hidden"
      >
        <ul className="flex gap-2 overflow-x-auto">
          {items.map((item, index) => {
            const active = item.id === activeId

            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => scrollToSection(item.id)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    active
                      ? 'border-[#222222] bg-[#222222] text-white'
                      : 'border-[#dddddd] bg-white text-[#484848] hover:border-[#222222] hover:text-[#222222]'
                  }`}
                >
                  <span className="text-xs font-bold tabular-nums opacity-70">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item.title}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}

export default GuideToc
