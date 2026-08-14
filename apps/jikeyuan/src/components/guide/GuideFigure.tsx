import type { GuideFigureData } from '../../content/guides'

interface GuideFigureProps {
  figure: GuideFigureData
  index: number
  glyph?: string
}

function GuideFigure({ figure, index, glyph }: GuideFigureProps) {
  return (
    <figure>
      <div className="aspect-[3/2] overflow-hidden rounded-[14px] bg-[#fff7f8]">
        {figure.image !== undefined ? (
          <img
            src={figure.image}
            alt={figure.alt}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={figure.alt}
            className="flex size-full items-center justify-center"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(34,34,34,0.06)]">
              {glyph !== undefined && (
                <img
                  src={glyph}
                  alt=""
                  aria-hidden="true"
                  className="size-8 object-contain"
                  draggable="false"
                />
              )}
            </span>
          </div>
        )}
      </div>
      <figcaption className="mt-2 text-xs leading-5 text-[#6a6a6a]">
        圖 {index}｜{figure.caption}
      </figcaption>
    </figure>
  )
}

export default GuideFigure
