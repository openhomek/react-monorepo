import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Input,
  Separator,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  Toaster,
} from '@react-monorepo/ui'
import {
  ArrowClockwise,
  CaretRight,
  ChatCircleText,
  CloudX,
  MagnifyingGlass,
  SpinnerGap,
  WarningCircle,
  WifiSlash,
} from '@phosphor-icons/react'
import { type FormEvent, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

type CommunityState =
  | 'ready'
  | 'loading'
  | 'empty'
  | 'error'
  | 'load-more-error'
  | 'offline-cache'
  | 'offline-empty'

type FeedTab = 'latest' | 'hot' | 'unanswered'

interface CommunityPost {
  id: number
  category: string
  title: string
  excerpt: string
  replies: number
  views: string
  time: string
}

const stateAliases: Record<string, CommunityState> = {
  loading: 'loading',
  empty: 'empty',
  error: 'error',
  'load-more-error': 'load-more-error',
  'offline-cache': 'offline-cache',
  'offline-empty': 'offline-empty',
}

const categoryFilters = [
  '全部',
  '入境升學',
  '租房住宿',
  '銀行貸款',
  '交通出行',
  '職場搵工',
  '校園生活',
]

const feedTabs: Array<{ value: FeedTab; label: string }> = [
  { value: 'latest', label: '最新' },
  { value: 'hot', label: '熱門' },
  { value: 'unanswered', label: '待回答' },
]

const posts: CommunityPost[] = [
  {
    id: 1,
    category: '租房住宿',
    title: '港大附近租房有哪些坑？中介話免佣可信嗎？',
    excerpt: '想搵步行 15 分鐘內嘅地方，但心驚中介收額外費用，真係有冇不收佣嘅盤？',
    replies: 128,
    views: '1.2K',
    time: '23 分鐘前',
  },
  {
    id: 2,
    category: '銀行貸款',
    title: '剛落地銀行戶口要帶咩中文件？',
    excerpt: '預約咗開戶但唔知學生證未到得唔得，想請教最近成功開戶嘅同學。',
    replies: 89,
    views: '845',
    time: '45 分鐘前',
  },
  {
    id: 3,
    category: '交通出行',
    title: '學生八達通點樣申請？',
    excerpt: '聽講可以用學生優惠，申請表係邊度攞？可唔可以網上申請？',
    replies: 76,
    views: '620',
    time: '1 小時前',
  },
  {
    id: 4,
    category: '租房住宿',
    title: '想寄租金住邊區比較最實際？',
    excerpt: '港島租金比較貴，但搭交通方便，大家會點樣揀？',
    replies: 64,
    views: '512',
    time: '1 小時前',
  },
  {
    id: 5,
    category: '校園生活',
    title: '港大宿舍申請幾時開始？',
    excerpt: '女舍同雙人房邊種比較好？新生一般住邊個宿舍？',
    replies: 41,
    views: '389',
    time: '2 小時前',
  },
]

const suggestedQuestions = [
  '香港租金點解每年都差咁遠？',
  '初到香港如何開通八達通及銀行戶口？',
  '港大周邊租屋，通勤的一個鐘有幾遠？',
]

function CommunitySkeleton() {
  return (
    <div className="space-y-0" aria-label="正在載入社區問題" aria-busy="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid min-h-[82px] grid-cols-[48px_minmax(0,1fr)] items-center gap-3 border-b border-[#eeeeee] py-3 md:grid-cols-[64px_minmax(0,1fr)_180px]"
        >
          <Skeleton className="size-12 rounded-md bg-[#f1f1f1]" />
          <div className="space-y-2.5">
            <Skeleton className="h-3.5 w-[48%] bg-[#eeeeee]" />
            <Skeleton className="h-3 w-[72%] bg-[#f1f1f1]" />
          </div>
          <Skeleton className="hidden h-3 w-24 justify-self-end bg-[#eeeeee] md:block" />
        </div>
      ))}
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#777777]">
        <SpinnerGap className="size-4 animate-spin" weight="regular" />
        載入中，請稍候…
      </div>
    </div>
  )
}

function EmptyState({ clearSearch }: { clearSearch: () => void }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-5 py-14 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-[#f7f7f7] text-[#3f3f3f]">
        <MagnifyingGlass size={52} weight="duotone" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold">暫時未有相關答案</h2>
      <p className="mt-2 text-sm leading-6 text-[#717171]">
        試試其他關鍵字，或直接所問走過同一段路的人。
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button
          className="h-11 rounded-lg px-5"
          onClick={() => toast.success('已為你開啟提問流程', {
            icon: <ChatCircleText size={16} weight="fill" />,
          })}
        >
          用這個問題發問
        </Button>
        <Button variant="outline" className="h-11 rounded-lg px-5" onClick={clearSearch}>
          清除篩選
        </Button>
      </div>
      <Separator className="my-7 max-w-md" />
      <div className="w-full max-w-xl text-left">
        <p className="mb-2 text-sm font-semibold">你也可以看看</p>
        {suggestedQuestions.map((question) => (
          <button
            key={question}
            type="button"
            className="flex min-h-11 w-full items-center justify-between border-b border-[#eeeeee] py-2 text-left text-sm hover:text-primary"
            onClick={() => toast.message(`已選擇：${question}`)}
          >
            <span>{question}</span>
            <CaretRight size={16} weight="regular" />
          </button>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="flex min-h-[410px] flex-col items-center justify-center px-5 py-14 text-center">
      <CloudX size={68} weight="duotone" className="text-[#9f9f9f]" aria-hidden="true" />
      <h2 className="mt-5 text-xl font-semibold">暫時載入不到內容</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#717171]">
        可能是系統忙碌，請稍後再試。您的搜尋條件已保留。
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="outline" className="h-11 rounded-lg border-primary px-5 text-primary" onClick={retry}>
          重新載入
        </Button>
        <Button variant="outline" className="h-11 rounded-lg px-5" asChild>
          <Link to="/community">返回熱門問題</Link>
        </Button>
      </div>
    </div>
  )
}

function OfflineEmptyState({ retry }: { retry: () => void }) {
  return (
    <main className="flex min-h-[calc(100dvh-65px)] flex-col items-center justify-center px-6 pb-20 text-center">
      <div className="flex size-28 items-center justify-center rounded-full bg-[#f7f7f7] text-[#a8a8a8]">
        <WifiSlash size={72} weight="duotone" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold">沒有網絡連線</h1>
      <p className="mt-3 text-sm text-[#717171]">檢查 Wi-Fi 或流動數據後再試。</p>
      <Button
        variant="outline"
        className="mt-7 h-12 min-w-40 rounded-lg border-primary px-6 text-base text-primary"
        onClick={retry}
      >
        重新連線
      </Button>
      <Button variant="link" className="mt-2 h-12 text-[#333333]" asChild>
        <Link to="/">返回首頁</Link>
      </Button>
    </main>
  )
}

function PostList() {
  return (
    <div aria-label="社區問題列表">
      {posts.map((post) => (
        <article
          key={post.id}
          className="grid min-h-[82px] grid-cols-[minmax(0,1fr)] items-center border-b border-[#eeeeee] py-3 sm:grid-cols-[76px_minmax(0,1fr)_230px] sm:gap-3"
        >
          <Badge
            variant="outline"
            className="mb-1.5 h-6 w-fit rounded-md border-primary/40 px-2 text-[11px] font-semibold text-primary sm:mb-0 sm:justify-self-start"
          >
            {post.category}
          </Badge>
          <div className="min-w-0">
            <h2 className="truncate text-[15px] leading-6 font-semibold sm:text-base">{post.title}</h2>
            <p className="truncate text-xs leading-5 text-[#717171] sm:text-sm">{post.excerpt}</p>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-[#717171] sm:mt-0 sm:justify-end">
            <span>{post.replies} 回覆</span>
            <span aria-hidden="true">·</span>
            <span>{post.views} 瀏覽</span>
            <span aria-hidden="true">·</span>
            <time>{post.time}</time>
          </div>
        </article>
      ))}
    </div>
  )
}

function CommunitySidebar() {
  return (
    <aside className="hidden w-[260px] shrink-0 space-y-4 lg:block" aria-label="社區資訊">
      <section className="rounded-[14px] border border-[#dddddd] p-5">
        <Button
          className="h-12 w-full rounded-lg text-base"
          onClick={() => toast.success('已為你開啟提問流程', {
            icon: <ChatCircleText size={16} weight="fill" />,
          })}
        >
          提出問題
        </Button>
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
          <ChatCircleText size={18} weight="regular" />
          提問攻略・精準支援
        </div>
        <p className="mt-2 text-xs leading-5 text-[#717171]">簡單描述問題，讓學長姐針對性分享可行建議。</p>
        <ul className="mt-3 space-y-1.5 text-xs leading-5 text-[#555555]">
          <li>• 寫清楚身份、地區及目標</li>
          <li>• 避免一題問太多不同情境</li>
          <li>• 匿名也能提問，保護你的隱私</li>
        </ul>
        <button type="button" className="mt-4 text-xs font-semibold text-primary hover:underline">
          查看社區規則 ›
        </button>
      </section>

      <section className="rounded-[14px] border border-[#dddddd] p-5">
        <h2 className="text-sm font-semibold">熱門標籤</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {['租房', '港大', '銀行開戶', '八達通', '學生簽證', '獎學金', '在內地轉帳', '序號'].map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </section>
    </aside>
  )
}

function Community() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedState = searchParams.get('state') ?? ''
  const state = stateAliases[requestedState] ?? 'ready'
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [category, setCategory] = useState('全部')
  const [feedTab, setFeedTab] = useState<FeedTab>('latest')

  const resultLabel = useMemo(() => {
    if (state === 'empty') return '0 個相關問題'
    return state === 'loading' ? '正在搜尋' : '24 個相關問題'
  }, [state])

  function setState(nextState: CommunityState) {
    if (nextState === 'ready') {
      setSearchParams({})
      return
    }
    setSearchParams({ state: nextState })
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedQuery(query.trim())
    if (query.trim().length > 0) setState('empty')
  }

  function clearSearch() {
    setQuery('')
    setSubmittedQuery('')
    setCategory('全部')
    setState('ready')
  }

  function handleReconnect() {
    setState('ready')
    toast.success('已恢復連線，內容已更新', {
      icon: <ArrowClockwise size={16} weight="fill" />,
    })
  }

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
          <AlertDescription className="flex min-h-7 w-full flex-row items-center justify-between gap-3 text-xs text-[#555555] sm:text-sm">
            <span>你目前離線，顯示上次瀏覽的結果</span>
            <button type="button" className="shrink-0 font-semibold text-primary" onClick={handleReconnect}>
              重新連線
            </button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mx-auto max-w-[1200px] px-6 py-7 min-[744px]:px-8 min-[744px]:py-8">
        <header>
          <h1 className="text-2xl font-bold tracking-[-0.02em] sm:text-[28px]">社區問答</h1>
          <p className="mt-1 text-sm text-[#717171]">有問題，問走過同一段路的人</p>
        </header>

        <div className="mt-5 flex gap-7">
          <section className="min-w-0 flex-1" aria-label="社區問題">
            <form className="flex h-12 items-center rounded-full border border-[#dddddd] bg-white pl-4 focus-within:border-primary" onSubmit={handleSearch}>
              <Input
                id="question-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="港大附近租房有哪些坑？"
                aria-label="搜尋社區問題"
                className="h-11 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              />
              <Button type="submit" size="icon" className="mr-1 size-10 rounded-full" aria-label="搜尋">
                <MagnifyingGlass size={20} weight="regular" />
              </Button>
            </form>

            <div className="horizontal-scroll mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="問題分類">
              {categoryFilters.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={category === item ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 shrink-0 rounded-full px-3 text-xs"
                  onClick={() => setCategory(item)}
                >
                  {item}
                </Button>
              ))}
            </div>

            <div className="mt-1 flex items-end justify-between border-b border-[#dddddd]">
              <Tabs value={feedTab} onValueChange={(value) => setFeedTab(value as FeedTab)}>
                <TabsList variant="line" className="h-12 gap-6">
                  {feedTabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="h-12 px-0 text-sm data-[state=active]:text-primary">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <span className="pb-3 text-xs text-[#717171]">
                {submittedQuery ? `「${submittedQuery}」・` : ''}{resultLabel}
              </span>
            </div>

            {state === 'loading' && <CommunitySkeleton />}
            {state === 'empty' && <EmptyState clearSearch={clearSearch} />}
            {state === 'error' && <ErrorState retry={() => setState('ready')} />}
            {(state === 'ready' || state === 'load-more-error' || state === 'offline-cache') && <PostList />}

            {state === 'load-more-error' ? (
              <Alert className="my-5 flex min-h-12 grid-cols-none items-center justify-center gap-3 rounded-lg border-primary/30 bg-[#fff5f6] px-4 py-2 text-primary">
                <WarningCircle size={16} weight="fill" />
                <AlertDescription className="block text-center text-sm text-[#b4233e]">
                  載入更多時遇到問題，請檢查網絡後再試。
                </AlertDescription>
                <Button variant="outline" size="sm" className="h-8 rounded-lg border-primary bg-white px-5 text-primary" onClick={() => setState('ready')}>
                  再試一次
                </Button>
              </Alert>
            ) : (state === 'ready' || state === 'offline-cache') ? (
              <div className="flex justify-center py-6">
                <Button variant="outline" className="h-11 rounded-lg px-6" onClick={() => setState('load-more-error')}>
                  載入更多
                </Button>
              </div>
            ) : null}

            {state === 'offline-cache' && (
              <Button
                variant="outline"
                className="sticky bottom-4 mt-2 h-12 w-full rounded-lg border-primary/25 bg-[#fff1f3] text-primary shadow-sm lg:hidden"
                onClick={handleReconnect}
              >
                <ArrowClockwise size={18} weight="regular" />
                連線後更新
              </Button>
            )}
          </section>

          <CommunitySidebar />
        </div>
      </div>
      <Toaster position="top-center" />
    </main>
  )
}

export default Community
