import { Badge } from '@react-monorepo/ui'
import { Link } from 'react-router-dom'

import type { Guide } from '../../content/guides'
import { categoryGlyphs } from './categoryGlyphs'

function GuideHero({ guide }: { guide: Guide }) {
  const glyph = categoryGlyphs[guide.category]

  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-6 min-[744px]:px-8 min-[744px]:pt-8">
      <nav
        aria-label="麵包屑"
        className="flex flex-wrap items-center gap-2 text-sm text-[#6a6a6a]"
      >
        <Link to="/" className="hover:text-primary">
          首頁
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/guides" className="hover:text-primary">
          新生攻略
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-[#222222]">
          {guide.category}
        </span>
      </nav>

      <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-[14px] bg-[#fff7f8]">
        {guide.image !== undefined ? (
          <img src={guide.image} alt={guide.imageAlt} className="size-full object-cover" />
        ) : (
          <div role="img" aria-label={guide.imageAlt} className="flex size-full items-center justify-center">
            <span className="flex size-28 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(34,34,34,0.06)] min-[744px]:size-32">
              {glyph !== undefined && (
                <img
                  src={glyph}
                  alt=""
                  aria-hidden="true"
                  className="size-14 object-contain min-[744px]:size-16"
                  draggable="false"
                />
              )}
            </span>
          </div>
        )}
        <Badge className="absolute left-4 top-4 z-10 h-7 rounded-full bg-white px-3 text-[11px] font-semibold text-[#222222] shadow-[0_1px_2px_rgba(34,34,34,0.08)]">
          {guide.category}
        </Badge>
      </div>
    </div>
  )
}

export default GuideHero
