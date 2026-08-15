import type { Guide } from '../../content/guides'
import { categoryGlyphs } from './categoryGlyphs'

function GuideCover({ guide }: { guide: Guide }) {
  const glyph = categoryGlyphs[guide.category]

  return (
    <figure className="mx-auto mt-5 max-w-[1200px] px-6 min-[744px]:px-8 min-[744px]:mt-6">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[10px] bg-[#f7f7f7]">
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
      </div>
    </figure>
  )
}

export default GuideCover
