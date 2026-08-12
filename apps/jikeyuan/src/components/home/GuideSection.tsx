import { Badge, Button } from '@react-monorepo/ui'
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Image as ImageIcon,
} from 'lucide-react'
import { useState } from 'react'

interface GuideItem {
  id: number
  category: string
  title: string
  description: string
  date: string
  imageSrc?: string
  imageAlt: string
}

// imageSrc 留空時會顯示中性資源槽；補上真實圖片路徑後會自動切換為圖片。
const guides: GuideItem[] = [
  {
    id: 1,
    category: '生活指南',
    title: '香港交通完全攻略：八達通、MTR 與巴士搭乘教學',
    description: '由八達通申請、轉乘優惠到轉乘技巧，一篇搞懂日常出行。',
    date: '2026-08-12',
    imageAlt: '香港街道與電車',
  },
  {
    id: 2,
    category: '新生攻略',
    title: '入境香港流程與時間線（2026 最新版）',
    description: '簽證、入境、領取學生證到住宿安排，按步驟一次過睇清楚。',
    date: '2026-08-12',
    imageAlt: '維多利亞港與香港天際線',
  },
  {
    id: 3,
    category: '校園生活',
    title: '香港學生必備 App 推薦清單',
    description: '學習、交通、外賣、優惠一應俱全，提升在港生活效率。',
    date: '2026-08-12',
    imageAlt: '香港大學圖書館自修空間',
  },
  {
    id: 4,
    category: '租房住宿',
    title: '第一次在香港租房：睇樓與簽約檢查表',
    description: '由預算、地區、代理佣金到交樓驗收，減少常見租屋風險。',
    date: '2026-08-10',
    imageAlt: '香港住宅大樓',
  },
  {
    id: 5,
    category: '銀行支付',
    title: '學生開戶文件與電子支付設定指南',
    description: '比較常見銀行所需文件，並整理日常轉帳與繳費設定。',
    date: '2026-08-08',
    imageAlt: '香港銀行服務與支付卡',
  },
  {
    id: 6,
    category: '電話網絡',
    title: '香港上網卡與月費計劃怎樣選？',
    description: '按流量、合約期與跨境需求，揀到適合新生的電話計劃。',
    date: '2026-08-06',
    imageAlt: '使用手機連接香港流動網絡',
  },
]

function GuideCard({ guide }: { guide: GuideItem }) {
  const [isSaved, setIsSaved] = useState(false)

  return (
    <article className="group overflow-hidden rounded-xl border border-[#dddddd] bg-white transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_30px_rgba(34,34,34,0.08)]">
      <div className="aspect-[16/7] overflow-hidden bg-[#f7f7f7]">
        {guide.imageSrc ? (
          <img
            src={guide.imageSrc}
            alt={guide.imageAlt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-[#b8b8b8]"
            role="img"
            aria-label={`${guide.imageAlt}，圖片資源待補`}
          >
            <ImageIcon className="size-8" strokeWidth={1.4} />
          </div>
        )}
      </div>

      <div className="flex min-h-[156px] flex-col p-2.5">
        <Badge
          variant="secondary"
          className="mb-2 w-fit rounded-md bg-[#fff0f2] text-[11px] font-semibold text-primary"
        >
          {guide.category}
        </Badge>
        <h3 className="text-[15px] leading-[22px] font-semibold text-[#222222]">
          {guide.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-[18px] text-[#666666]">
          {guide.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-[#777777]">
          <time className="inline-flex items-center gap-2" dateTime={guide.date}>
            <CalendarDays className="size-4" />
            {guide.date}
          </time>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-9 rounded-full hover:bg-[#fff0f2] hover:text-primary"
            aria-label={isSaved ? `取消收藏：${guide.title}` : `收藏：${guide.title}`}
            aria-pressed={isSaved}
            onClick={() => setIsSaved((current) => !current)}
          >
            <Bookmark className={isSaved ? 'fill-current text-primary' : ''} />
          </Button>
        </div>
      </div>
    </article>
  )
}

function GuideSection() {
  const [showAll, setShowAll] = useState(false)
  const visibleGuides = showAll ? guides : guides.slice(0, 3)

  return (
    <section
      id="guides"
      className="scroll-mt-24 bg-white pb-2"
      aria-labelledby="guides-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 min-[744px]:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="guides-heading" className="text-xl font-bold sm:text-2xl">
            新生熱門攻略
          </h2>
          <Button
            type="button"
            variant="link"
            className="h-10 px-0 font-semibold text-primary"
            aria-expanded={showAll}
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? '收起' : '查看全部'}
            <ArrowRight className={showAll ? 'rotate-90' : ''} />
          </Button>
        </div>

        <div className="mt-2 grid gap-4 min-[744px]:grid-cols-3">
          {visibleGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default GuideSection
