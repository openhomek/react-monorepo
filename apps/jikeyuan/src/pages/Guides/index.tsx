import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Input,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  Toaster,
} from '@react-monorepo/ui'
import {
  ArrowClockwise,
  BookmarkSimple,
  CaretRight,
  ChatCircleText,
  Clock,
  CloudX,
  Compass,
  MagnifyingGlass,
  SealCheck,
  SpinnerGap,
  WarningCircle,
  WifiSlash,
  X,
} from '@phosphor-icons/react'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { categoryGlyphs } from '../../components/guide/categoryGlyphs'
import { type Guide, guides } from '../../content/guides'

type GuidesState =
  | 'ready'
  | 'loading'
  | 'error'
  | 'empty'
  | 'load-more-error'
  | 'offline-cache'
  | 'offline-empty'
  | 'guest-favorite'

type SortTab = 'latest' | 'useful'

const stateAliases: Record<string, GuidesState> = {
  loading: 'loading',
  empty: 'empty',
  error: 'error',
  'load-more-error': 'load-more-error',
  'offline-cache': 'offline-cache',
  'offline-empty': 'offline-empty',
  'guest-favorite': 'guest-favorite',
}

const LIST_VISIBLE_STATES: readonly GuidesState[] = [
  'ready',
  'load-more-error',
  'offline-cache',
  'guest-favorite',
]

const categoryFilters = [
  '全部',
  '入境證件',
  '租房住宿',
  '銀行支付',
  '交通出行',
  '電話網絡',
  '校園生活',
]

const SAVED_GUIDES_KEY = 'jikeyuan:saved-guides'
const LOCAL_SAVE_CONSENT_KEY = 'jikeyuan:local-favorites-consent'

function readSavedGuides(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(SAVED_GUIDES_KEY) ?? '[]')
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

interface SaveControls {
  savedSlugs: string[]
  onToggle: (guide: Guide) => void
}

function GuidePhoto({ guide, plateClassName }: { guide: Guide; plateClassName: string }) {
  if (guide.image) {
    return (
      <img
        src={guide.image}
        alt={guide.imageAlt}
        loading="lazy"
        decoding="async"
        className={`w-full object-cover ${plateClassName}`}
      />
    )
  }

  const glyph = categoryGlyphs[guide.category]

  return (
    <div
      role="img"
      aria-label={guide.imageAlt}
      className={`flex items-center justify-center bg-[#fff7f8] ${plateClassName}`}
    >
      <span className="flex size-20 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(34,34,34,0.06)]">
        {glyph !== undefined && (
          <img
            src={glyph}
            alt=""
            aria-hidden="true"
            className="size-10 object-contain"
            draggable="false"
          />
        )}
      </span>
    </div>
  )
}

function SaveButton({ guide, controls }: { guide: Guide; controls: SaveControls }) {
  const saved = controls.savedSlugs.includes(guide.slug)

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `取消收藏「${guide.cardTitle}」` : `收藏「${guide.cardTitle}」`}
      onClick={(event) => {
        event.preventDefault()
        controls.onToggle(guide)
      }}
      className={`absolute right-3 top-3 z-10 flex size-11 items-center justify-center rounded-full bg-white text-[#222222] shadow-[0_1px_2px_rgba(34,34,34,0.1)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        saved ? 'text-primary' : ''
      }`}
    >
      <BookmarkSimple size={20} weight={saved ? 'fill' : 'regular'} aria-hidden="true" />
    </button>
  )
}

function GuideCard({ guide, controls }: { guide: Guide; controls: SaveControls }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[14px] border border-[#dddddd] bg-white transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_30px_rgba(34,34,34,0.08)]">
      <div className="relative">
        <Link
          to={guide.path}
          aria-label={`閱讀攻略：${guide.cardTitle}`}
          className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <GuidePhoto guide={guide} plateClassName="aspect-[3/2]" />
        </Link>
        <Badge className="absolute left-3 top-3 z-10 h-7 rounded-full bg-white px-2.5 text-[11px] font-semibold text-[#222222] shadow-[0_1px_2px_rgba(34,34,34,0.08)]">
          {guide.category}
        </Badge>
        <SaveButton guide={guide} controls={controls} />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base leading-6 font-semibold text-[#222222]">
          <Link
            to={guide.path}
            className="group-hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {guide.cardTitle}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#717171]">
          {guide.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-[#717171]">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <SealCheck size={14} weight="regular" aria-hidden="true" className="shrink-0 text-primary" />
            最後核實 {guide.reviewedDate}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <Clock size={14} weight="regular" aria-hidden="true" />
            {guide.readingTime}
          </span>
        </div>
      </div>
    </article>
  )
}

function CachedThumb({ guide }: { guide: Guide }) {
  if (guide.image) {
    return (
      <img
        src={guide.image}
        alt={guide.imageAlt}
        loading="lazy"
        decoding="async"
        className="aspect-[3/2] w-32 shrink-0 rounded-lg object-cover"
      />
    )
  }

  const glyph = categoryGlyphs[guide.category]

  return (
    <div
      role="img"
      aria-label={guide.imageAlt}
      className="flex aspect-[3/2] w-32 shrink-0 items-center justify-center rounded-lg bg-[#fff7f8]"
    >
      {glyph !== undefined && (
        <img src={glyph} alt="" aria-hidden="true" className="size-9 object-contain" draggable="false" />
      )}
    </div>
  )
}

function CachedGuideRow({ guide, controls }: { guide: Guide; controls: SaveControls }) {
  const saved = controls.savedSlugs.includes(guide.slug)

  return (
    <article className="flex items-center gap-4 border-b border-[#ebebeb] py-3">
      <Link
        to={guide.path}
        aria-label={`閱讀攻略：${guide.cardTitle}`}
        className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <CachedThumb guide={guide} />
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-[#222222]">
          <Link
            to={guide.path}
            className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {guide.cardTitle}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-3 text-xs text-[#717171]">
          <span className="inline-flex items-center gap-1">
            <SealCheck size={13} weight="regular" aria-hidden="true" className="shrink-0 text-primary" />
            最後核實 {guide.reviewedDate}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} weight="regular" aria-hidden="true" className="shrink-0" />
            {guide.readingTime}
          </span>
        </p>
      </div>

      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? `取消收藏「${guide.cardTitle}」` : `收藏「${guide.cardTitle}」`}
        onClick={() => controls.onToggle(guide)}
        className={`flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#f7f7f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          saved ? 'text-primary' : 'text-[#222222]'
        }`}
      >
        <BookmarkSimple size={20} weight={saved ? 'fill' : 'regular'} aria-hidden="true" />
      </button>
    </article>
  )
}

function FeaturedGuide({ guide, controls }: { guide: Guide; controls: SaveControls }) {
  const saved = controls.savedSlugs.includes(guide.slug)

  return (
    <section
      aria-labelledby="featured-guide-heading"
      className="overflow-hidden rounded-[14px] border border-[#dddddd] bg-white transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-[0_12px_30px_rgba(34,34,34,0.08)]"
    >
      <div className="grid min-[744px]:grid-cols-[1.15fr_1fr]">
        <Link
          to={guide.path}
          aria-label={`閱讀攻略：${guide.cardTitle}`}
          className="relative block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <GuidePhoto
            guide={guide}
            plateClassName="aspect-[16/10] min-[744px]:aspect-auto min-[744px]:h-full"
          />
          <Badge className="absolute left-4 top-4 z-10 h-7 rounded-full bg-white px-3 text-[11px] font-semibold text-[#222222] shadow-[0_1px_2px_rgba(34,34,34,0.08)]">
            編輯精選
          </Badge>
        </Link>

        <div className="flex flex-col p-5 min-[744px]:p-7">
          <Badge
            variant="outline"
            className="w-fit rounded-md border-primary/40 px-2 text-[11px] font-semibold text-primary"
          >
            {guide.category}
          </Badge>
          <h2
            id="featured-guide-heading"
            className="mt-3 text-xl leading-8 font-bold tracking-[-0.01em] sm:text-2xl sm:leading-9"
          >
            <Link
              to={guide.path}
              className="hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {guide.cardTitle}
            </Link>
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#717171]">{guide.description}</p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#717171]">
            <span className="inline-flex items-center gap-1.5">
              <SealCheck size={14} weight="regular" aria-hidden="true" className="text-primary" />
              最後核實 {guide.reviewedDate}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} weight="regular" aria-hidden="true" />
              {guide.readingTime}
            </span>
          </div>

          <div className="mt-auto flex flex-wrap gap-3 pt-5">
            <Button className="h-11 rounded-lg px-5" asChild>
              <Link to={guide.path}>
                閱讀攻略
                <CaretRight size={16} weight="regular" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              variant="outline"
              aria-pressed={saved}
              className="h-11 rounded-lg px-5"
              onClick={() => controls.onToggle(guide)}
            >
              <BookmarkSimple
                size={18}
                weight={saved ? 'fill' : 'regular'}
                aria-hidden="true"
                className={saved ? 'text-primary' : undefined}
              />
              {saved ? '已收藏' : '收藏'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function GuidesSkeleton() {
  return (
    <div aria-label="正在載入攻略" aria-busy="true">
      <div className="overflow-hidden rounded-[14px] border border-[#dddddd]">
        <div className="grid min-[744px]:grid-cols-[1.15fr_1fr]">
          <Skeleton className="aspect-[16/10] rounded-none bg-[#f2f2f2] min-[744px]:aspect-auto min-[744px]:h-full" />
          <div className="space-y-3 p-5 min-[744px]:p-7">
            <Skeleton className="h-5 w-20 bg-[#ebebeb]" />
            <Skeleton className="h-7 w-4/5 bg-[#f2f2f2]" />
            <Skeleton className="h-4 w-full bg-[#ebebeb]" />
            <Skeleton className="h-4 w-2/3 bg-[#f2f2f2]" />
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-11 w-32 rounded-lg bg-[#f2f2f2]" />
              <Skeleton className="h-11 w-24 rounded-lg bg-[#ebebeb]" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 min-[744px]:grid-cols-2 min-[1128px]:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[14px] border border-[#dddddd]">
            <Skeleton className="aspect-[3/2] rounded-none bg-[#f2f2f2]" />
            <div className="space-y-2.5 p-4">
              <Skeleton className="h-4 w-11/12 bg-[#ebebeb]" />
              <Skeleton className="h-3 w-full bg-[#f2f2f2]" />
              <Skeleton className="h-3 w-2/3 bg-[#f2f2f2]" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#6a6a6a]">
        <SpinnerGap className="size-4 animate-spin" weight="regular" />
        載入中，請稍候…
      </div>
    </div>
  )
}

function SearchEmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-5 py-14 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-[#f7f7f7] text-[#3f3f3f]">
        <MagnifyingGlass size={52} weight="duotone" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold">
        {query.length > 0 ? `找不到「${query}」的相關攻略` : '找不到相關攻略'}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#6a6a6a]">
        攻略未覆蓋這個問題？直接問走過同一段路的人。
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button className="h-11 rounded-lg px-5" asChild>
          <Link to={`/questions/new?title=${encodeURIComponent(query)}`}>
            <ChatCircleText size={16} weight="fill" />
            用這個問題發問
          </Link>
        </Button>
        <Button variant="outline" className="h-11 rounded-lg px-5" onClick={onClear}>
          清除篩選
        </Button>
      </div>

      <Separator className="my-7 max-w-md" />

      <div className="w-full max-w-xl text-left">
        <p className="mb-2 text-sm font-semibold">先看看這些攻略</p>
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            to={guide.path}
            className="flex min-h-11 w-full items-center justify-between gap-4 border-b border-[#ebebeb] py-2 text-left text-sm transition-colors hover:text-primary"
          >
            <span className="min-w-0 truncate">
              <span className="mr-2 text-xs text-primary">{guide.category}</span>
              {guide.cardTitle}
            </span>
            <CaretRight size={16} weight="regular" aria-hidden="true" className="shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}

function CategoryEmptyState({
  category,
  onClear,
}: {
  category: string
  onClear: () => void
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-5 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#f7f7f7] text-[#3f3f3f]">
        <Compass size={40} weight="duotone" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-semibold">{category}攻略整理中</h2>
      <p className="mt-1.5 text-sm leading-6 text-[#6a6a6a]">
        我們正按官方資料核實這個分類，先看看其他分類的攻略。
      </p>
      <Button variant="outline" size="sm" className="mt-4 h-9 rounded-lg px-4" onClick={onClear}>
        清除分類
      </Button>
    </div>
  )
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="flex min-h-[410px] flex-col items-center justify-center px-5 py-14 text-center">
      <CloudX size={68} weight="duotone" className="text-[#929292]" aria-hidden="true" />
      <h2 className="mt-5 text-xl font-semibold">暫時載入不到攻略</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#6a6a6a]">
        可能是系統忙碌，請稍後再試。你的搜尋條件已保留。
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="outline" className="h-11 rounded-lg border-primary px-5 text-primary" onClick={retry}>
          重新載入
        </Button>
        <Button variant="outline" className="h-11 rounded-lg px-5" asChild>
          <Link to="/">返回首頁</Link>
        </Button>
      </div>
    </div>
  )
}

function OfflineEmptyState({ retry }: { retry: () => void }) {
  return (
    <main className="flex min-h-[calc(100dvh-65px)] flex-col items-center justify-center px-6 pb-20 text-center">
      <div className="flex size-28 items-center justify-center rounded-full bg-[#f7f7f7] text-[#929292]">
        <WifiSlash size={72} weight="duotone" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold">沒有網絡連線</h1>
      <p className="mt-3 text-sm text-[#6a6a6a]">檢查 Wi-Fi 或流動數據後再試。</p>
      <Button
        variant="outline"
        className="mt-7 h-12 min-w-40 rounded-lg border-primary px-6 text-base text-primary"
        onClick={retry}
      >
        重新連線
      </Button>
      <Button variant="link" className="mt-2 h-12 text-[#222222]" asChild>
        <Link to="/">返回首頁</Link>
      </Button>
    </main>
  )
}

function GuidesSidebar() {
  return (
    <aside className="hidden w-[260px] shrink-0 space-y-4 min-[1128px]:block" aria-label="攻略資訊">
      <section className="rounded-[14px] border border-[#dddddd] p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ChatCircleText size={18} weight="regular" aria-hidden="true" />
          攻略沒有你要的答案？
        </h2>
        <p className="mt-2 text-xs leading-5 text-[#6a6a6a]">
          把具體情境帶進社區，讓學長姐針對你的情況回覆。
        </p>
        <Button className="mt-4 h-12 w-full rounded-lg" asChild>
          <Link to="/questions/new">提出問題</Link>
        </Button>
      </section>

      <section className="rounded-[14px] border border-[#dddddd] p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <SealCheck size={18} weight="regular" aria-hidden="true" className="text-primary" />
          「最後核實」是甚麼？
        </h2>
        <p className="mt-2 text-xs leading-5 text-[#6a6a6a]">
          每篇攻略都標示編輯部最後核對官方資料的日期。高風險資訊（流程、費用、文件）辦理前，請再查閱攻略內列出的官方頁面。
        </p>
      </section>
    </aside>
  )
}

function Guides() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedState = searchParams.get('state') ?? ''
  const state = stateAliases[requestedState] ?? 'ready'
  const activeQuery = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? '全部'
  const sort: SortTab = searchParams.get('sort') === 'useful' ? 'useful' : 'latest'

  const [draftQuery, setDraftQuery] = useState(activeQuery)
  const [savedSlugs, setSavedSlugs] = useState<string[]>(readSavedGuides)
  const [pendingSaveSlug, setPendingSaveSlug] = useState<string | null>(null)

  useEffect(() => {
    setDraftQuery(activeQuery)
  }, [activeQuery])

  const listIsVisible = LIST_VISIBLE_STATES.includes(state)

  const latestGuides = useMemo(
    () => [...guides].sort((a, b) => b.reviewedDate.localeCompare(a.reviewedDate)),
    [],
  )
  const baseGuides = sort === 'useful' ? guides : latestGuides
  const featuredGuide = guides.find((guide) => guide.featured) ?? latestGuides[0]

  const normalizedQuery = activeQuery.trim().toLowerCase()

  const visibleGuides = useMemo(() => {
    if (!listIsVisible) return []
    return baseGuides.filter((guide) => {
      const matchesCategory = category === '全部' || guide.category === category
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [guide.title, guide.cardTitle, guide.description, guide.category].some((field) =>
          field.toLowerCase().includes(normalizedQuery),
        )
      return matchesCategory && matchesQuery
    })
  }, [baseGuides, category, normalizedQuery, listIsVisible])

  const showFeatured =
    listIsVisible && state !== 'offline-cache' && normalizedQuery.length === 0 && category === '全部' && featuredGuide !== undefined
  const gridGuides = showFeatured
    ? visibleGuides.filter((guide) => guide.slug !== featuredGuide.slug)
    : visibleGuides

  const resultLabel = useMemo(() => {
    if (state === 'loading') return normalizedQuery.length > 0 ? '正在搜尋' : '正在載入'
    if (state === 'empty') return '0 篇相關攻略'
    if (!listIsVisible) return ''
    const queryPrefix = normalizedQuery.length > 0 ? `「${activeQuery.trim()}」· ` : ''
    const categoryPrefix = category === '全部' ? '' : `${category} · `
    return `${queryPrefix}${categoryPrefix}共 ${visibleGuides.length} 篇攻略`
  }, [state, normalizedQuery.length, activeQuery, category, listIsVisible, visibleGuides.length])

  const pendingGuide =
    pendingSaveSlug === null ? undefined : guides.find((guide) => guide.slug === pendingSaveSlug)

  useEffect(() => {
    if (state === 'guest-favorite' && pendingSaveSlug === null && featuredGuide !== undefined) {
      setPendingSaveSlug(featuredGuide.slug)
    }
  }, [state, pendingSaveSlug, featuredGuide])

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams)
    mutate(next)
    setSearchParams(next)
  }

  function setState(nextState: GuidesState) {
    updateParams((params) => {
      if (nextState === 'ready') {
        params.delete('state')
        return
      }
      params.set('state', nextState)
    })
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = draftQuery.trim()
    updateParams((params) => {
      if (trimmed.length > 0) {
        params.set('q', trimmed)
      } else {
        params.delete('q')
      }
      params.delete('state')
    })
  }

  function clearSearch() {
    updateParams((params) => {
      params.delete('q')
      params.delete('category')
      params.delete('state')
    })
  }

  function selectCategory(nextCategory: string) {
    updateParams((params) => {
      if (nextCategory === '全部') {
        params.delete('category')
      } else {
        params.set('category', nextCategory)
      }
    })
  }

  function selectSort(nextSort: SortTab) {
    updateParams((params) => {
      if (nextSort === 'latest') {
        params.delete('sort')
      } else {
        params.set('sort', nextSort)
      }
    })
  }

  function handleReconnect() {
    setState('ready')
    toast.success('已恢復連線，內容已更新', {
      icon: <ArrowClockwise size={16} weight="fill" />,
    })
  }

  function persistSaved(next: string[]) {
    setSavedSlugs(next)
    window.localStorage.setItem(SAVED_GUIDES_KEY, JSON.stringify(next))
  }

  function closeSheet() {
    setPendingSaveSlug(null)
    if (state === 'guest-favorite') {
      setState('ready')
    }
  }

  function toggleSave(guide: Guide) {
    if (savedSlugs.includes(guide.slug)) {
      const next = savedSlugs.filter((slug) => slug !== guide.slug)
      persistSaved(next)
      toast('已取消收藏', {
        description: guide.cardTitle,
        action: { label: '復原', onClick: () => persistSaved([...next, guide.slug]) },
      })
      return
    }

    if (window.localStorage.getItem(LOCAL_SAVE_CONSENT_KEY) !== 'true') {
      setPendingSaveSlug(guide.slug)
      return
    }

    const next = [...savedSlugs, guide.slug]
    persistSaved(next)
    toast('已收藏攻略', {
      description: guide.cardTitle,
      action: { label: '復原', onClick: () => persistSaved(savedSlugs) },
    })
  }

  function handleLocalSave() {
    if (pendingGuide === undefined) return

    window.localStorage.setItem(LOCAL_SAVE_CONSENT_KEY, 'true')
    const next = Array.from(new Set([...savedSlugs, pendingGuide.slug]))
    persistSaved(next)
    closeSheet()
    toast('已收藏在這台裝置', {
      description: pendingGuide.cardTitle,
      action: {
        label: '復原',
        onClick: () => persistSaved(next.filter((slug) => slug !== pendingGuide.slug)),
      },
    })
  }

  const saveControls: SaveControls = { savedSlugs, onToggle: toggleSave }

  if (state === 'offline-empty') {
    return (
      <>
        <OfflineEmptyState retry={handleReconnect} />
        <Toaster position="top-center" />
      </>
    )
  }

  return (
    <main className="min-h-[calc(100dvh-65px)] bg-white">
      {state === 'offline-cache' && (
        <Alert className="mx-auto max-w-[1200px] rounded-none border-x-0 border-t-0 border-primary/25 bg-[#fff5f6] px-6 py-2 text-primary min-[744px]:px-8">
          <WifiSlash size={16} weight="fill" />
          <AlertDescription className="flex min-h-7 w-full flex-row items-center justify-between gap-3 text-xs text-[#3f3f3f] sm:text-sm">
            <span className="inline-flex min-w-0 flex-wrap items-center gap-x-2">
              <span>你目前離線，顯示上次瀏覽的攻略</span>
              <span className="text-[#6a6a6a]">最後更新：昨日 21:40</span>
            </span>
            <button type="button" className="shrink-0 font-semibold text-primary" onClick={handleReconnect}>
              重新連線
            </button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mx-auto max-w-[1200px] px-6 py-7 pb-28 min-[744px]:px-8 min-[744px]:pb-32 min-[1128px]:pb-7">
        <header>
          <h1 className="text-2xl font-bold tracking-[-0.02em] sm:text-[28px]">香港生活攻略</h1>
          <p className="mt-1 text-sm text-[#6a6a6a]">
            按你現在要做的事，找到可靠又最新的步驟。
          </p>
        </header>

        <div className="mt-5 flex gap-7">
          <section className="min-w-0 flex-1" aria-label="攻略列表">
            <form
              className="flex h-12 items-center rounded-full border border-[#dddddd] bg-white pl-4 focus-within:border-primary"
              onSubmit={handleSearch}
            >
              <Input
                id="guide-search"
                type="search"
                value={draftQuery}
                onChange={(event) => setDraftQuery(event.target.value)}
                placeholder="搜尋銀行開戶、八達通、租房…"
                aria-label="搜尋攻略"
                className="h-11 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              />
              <Button type="submit" size="icon" className="mr-1 size-10 rounded-full" aria-label="搜尋">
                <MagnifyingGlass size={20} weight="regular" />
              </Button>
            </form>

            <div className="horizontal-scroll mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="攻略分類">
              {categoryFilters.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={category === item ? 'default' : 'outline'}
                  size="sm"
                  aria-pressed={category === item}
                  className="h-8 shrink-0 rounded-full px-3 text-xs"
                  onClick={() => selectCategory(item)}
                >
                  {item}
                </Button>
              ))}
            </div>

            {category !== '全部' && listIsVisible && (
              <div className="mt-2">
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-[#fff0f2] px-3 text-xs font-semibold text-primary transition hover:bg-[#ffe3e7]"
                  onClick={() => selectCategory('全部')}
                  aria-label={`清除分類 ${category}`}
                >
                  {category}
                  <X size={12} weight="bold" aria-hidden="true" />
                </button>
              </div>
            )}

            <div className="mt-1 flex items-end justify-between border-b border-[#dddddd]">
              <Tabs value={sort} onValueChange={(value) => selectSort(value as SortTab)}>
                <TabsList variant="line" aria-label="攻略排序" className="h-12 gap-6">
                  <TabsTrigger
                    value="latest"
                    className="px-0 text-sm data-[state=active]:text-primary"
                  >
                    最新
                  </TabsTrigger>
                  <TabsTrigger
                    value="useful"
                    className="px-0 text-sm data-[state=active]:text-primary"
                  >
                    最實用
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <span className="pb-3 text-xs text-[#6a6a6a]" aria-live="polite">
                {resultLabel}
              </span>
            </div>

            <div className="mt-6 space-y-6">
              {state === 'loading' && <GuidesSkeleton />}
              {state === 'error' && <ErrorState retry={() => setState('ready')} />}
              {state === 'empty' && (
                <SearchEmptyState query={activeQuery.trim()} onClear={clearSearch} />
              )}

              {state === 'offline-cache' ? (
                <div aria-label="已快取的攻略">
                  {gridGuides.map((guide) => (
                    <CachedGuideRow key={guide.slug} guide={guide} controls={saveControls} />
                  ))}
                </div>
              ) : listIsVisible ? (
                <>
                  {showFeatured && featuredGuide !== undefined && (
                    <FeaturedGuide guide={featuredGuide} controls={saveControls} />
                  )}

                  {gridGuides.length > 0 ? (
                    <div className="grid gap-4 min-[744px]:grid-cols-2 min-[1128px]:grid-cols-3">
                      {gridGuides.map((guide) => (
                        <GuideCard key={guide.slug} guide={guide} controls={saveControls} />
                      ))}
                    </div>
                  ) : normalizedQuery.length > 0 ? (
                    <SearchEmptyState query={activeQuery.trim()} onClear={clearSearch} />
                  ) : (
                    <CategoryEmptyState category={category} onClear={() => selectCategory('全部')} />
                  )}
                </>
              ) : null}

              {state === 'load-more-error' ? (
                <Alert className="flex min-h-12 items-center justify-center gap-3 rounded-lg border-primary/30 bg-[#fff5f6] px-4 py-2 text-primary">
                  <WarningCircle size={16} weight="fill" />
                  <AlertDescription className="text-center text-sm text-[#c13515]">
                    載入更多攻略時遇到問題，請檢查網絡後再試。
                  </AlertDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg border-primary bg-white px-5 text-primary"
                    onClick={() => setState('ready')}
                  >
                    再試一次
                  </Button>
                </Alert>
              ) : listIsVisible && state !== 'offline-cache' ? (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="h-11 rounded-lg px-6"
                    onClick={() => setState('load-more-error')}
                  >
                    載入更多
                  </Button>
                </div>
              ) : null}

              {state === 'offline-cache' && (
                <Button
                  variant="outline"
                  className="sticky bottom-4 h-12 w-full rounded-lg border-primary/25 bg-[#fff1f3] text-primary shadow-sm min-[1128px]:hidden"
                  onClick={handleReconnect}
                >
                  <ArrowClockwise size={18} weight="regular" />
                  重新連線
                </Button>
              )}
            </div>
          </section>

          <GuidesSidebar />
        </div>
      </div>

      <Sheet
        open={pendingGuide !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            closeSheet()
          }
        }}
      >
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl px-6 pb-7 pt-8">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#fff0f2] text-primary">
            <BookmarkSimple size={36} weight="duotone" aria-hidden="true" />
          </div>
          <SheetHeader className="items-center p-0 pt-5 text-center">
            <SheetTitle className="text-lg">登入後即可收藏</SheetTitle>
            <SheetDescription className="leading-6">
              收藏的攻略會跟著帳戶走，換裝置也看得到。想先試用，也可以先收藏在這台裝置。
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="flex flex-col gap-3 p-0 pt-6">
            <Button className="h-12 w-full rounded-lg text-base" asChild>
              <Link to="/login" onClick={closeSheet}>
                登入
              </Link>
            </Button>
            <Button variant="outline" className="h-12 w-full rounded-lg text-base" onClick={handleLocalSave}>
              先收藏在這台裝置
            </Button>
            <Button variant="link" className="h-12 w-full text-base text-[#222222]" onClick={closeSheet}>
              稍後再設
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Toaster position="top-center" />
    </main>
  )
}

export default Guides
