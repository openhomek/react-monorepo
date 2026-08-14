import {
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@react-monorepo/ui'
import {
  ArrowRight,
  MessageCircle,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'

type CommunityFeed = 'latest' | 'hot' | 'unanswered'

interface CommunityPost {
  id: number
  category: string
  title: string
  excerpt: string
  comments: number
  time: string
  isRising?: boolean
}

const hotPosts: CommunityPost[] = [
  {
    id: 1,
    category: '新生攻略',
    title: '剛到香港第一星期，最容易踩哪些坑？',
    excerpt: '剛到香港覺得好多嘢都好新鮮，但都驚一不小心踩坑，先問下大家最常見…',
    comments: 128,
    time: '23 分鐘前',
    isRising: true,
  },
  {
    id: 2,
    category: '租房住宿',
    title: '港大附近租房有哪些坑？中介話免佣可信嗎？',
    excerpt: '想搵步行 15 分鐘內嘅地方，怕被收多個月按金…',
    comments: 89,
    time: '45 分鐘前',
  },
  {
    id: 3,
    category: '校園生活',
    title: '香港學生必備 App 推薦清單',
    excerpt: '學習、交通、外賣、優惠一應俱全，提升在港生活效率',
    comments: 76,
    time: '1 小時前',
  },
  {
    id: 4,
    category: '銀行支付',
    title: '開香港銀行戶口要帶咩文件？',
    excerpt: '內地卡好用嗎？第一次來香港，唔確定要預約同準備咩資料…',
    comments: 64,
    time: '1 小時前',
  },
  {
    id: 5,
    category: '社交生活',
    title: '第一次一個人來香港，怎樣認識朋友？',
    excerpt: '想認識同樣新嚟嘅人，有冇活動或群組推薦？',
    comments: 52,
    time: '2 小時前',
  },
  {
    id: 6,
    category: '校園生活',
    title: '理大宿舍申請幾時開始？',
    excerpt: '成功率高唔高？想知流程同截止日期，有冇學長姐經驗分享…',
    comments: 41,
    time: '3 小時前',
  },
]

const latestPosts: CommunityPost[] = [
  {
    id: 1,
    category: '電話網絡',
    title: '剛落地香港，邊張電話卡即買即用？',
    excerpt: '想先用一個月，主要需要上網同收銀行驗證碼。',
    comments: 3,
    time: '4 分鐘前',
  },
  {
    id: 2,
    category: '交通出行',
    title: '學生八達通線上申請後要等幾耐？',
    excerpt: '文件已經交齊，想知未收到實體卡之前可以點搭車。',
    comments: 6,
    time: '8 分鐘前',
  },
  {
    id: 3,
    category: '租房住宿',
    title: '簽租約前，點樣查單位有冇僭建？',
    excerpt: '第一次租香港唐樓，想確認業主資料同單位狀況。',
    comments: 11,
    time: '12 分鐘前',
  },
  ...hotPosts.slice(0, 3).map((post, index) => ({
    ...post,
    id: index + 4,
  })),
]

const unansweredPosts: CommunityPost[] = [
  {
    id: 1,
    category: '入境證件',
    title: '補領小白條需要預約嗎？',
    excerpt: '文件不小心遺失，想知可否即日到入境處辦理。',
    comments: 0,
    time: '18 分鐘前',
  },
  {
    id: 2,
    category: '校園生活',
    title: '城大研究生迎新日可以帶家人嗎？',
    excerpt: '家人剛好同行，官網暫時搵唔到訪客安排。',
    comments: 0,
    time: '32 分鐘前',
  },
  {
    id: 3,
    category: '銀行支付',
    title: '未有住址證明可以開學生戶口嗎？',
    excerpt: '暫住酒店，手上只有錄取信同入境標籤。',
    comments: 0,
    time: '1 小時前',
  },
]

const feeds: Record<CommunityFeed, CommunityPost[]> = {
  latest: latestPosts,
  hot: hotPosts,
  unanswered: unansweredPosts,
}

function PostRow({ post }: { post: CommunityPost }) {
  return (
    <article
      className={`grid min-h-[78px] grid-cols-[48px_minmax(0,1fr)] items-center gap-x-3 border-b border-[#eeeeee] px-3 py-1.5 sm:grid-cols-[64px_minmax(0,1fr)_62px_78px] sm:px-5 ${
        post.isRising
          ? 'rounded-xl border border-primary/30 bg-[#fff7f8]'
          : ''
      }`}
    >
      <div
        className={`flex h-full flex-col items-center justify-center text-3xl font-medium ${
          post.isRising ? 'text-primary' : 'text-[#717171]'
        }`}
        aria-label={`排行第 ${post.id}`}
      >
        <span>{post.id}</span>
        {post.isRising && (
          <span className="mt-1 flex items-center gap-0.5 text-[11px] leading-none font-semibold">
            <TrendingUp className="size-3.5" />
            熱度上升
          </span>
        )}
      </div>

      <div className="min-w-0">
        <Badge
          variant="secondary"
          className="mb-1 h-5 rounded-md bg-[#fff0f2] px-1.5 text-[11px] font-semibold text-primary"
        >
          {post.category}
        </Badge>
        <h3 className="truncate text-[15px] leading-6 font-semibold text-[#222222] sm:text-base">
          {post.title}
        </h3>
        <p className="truncate text-xs leading-5 text-[#717171] sm:text-sm">
          {post.excerpt}
        </p>
      </div>

      <div className="col-start-2 mt-2 flex items-center gap-4 text-xs text-[#717171] sm:col-start-auto sm:mt-0 sm:justify-center">
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="size-4" />
          {post.comments}
        </span>
        <span className="sm:hidden">{post.time}</span>
      </div>

      <time className="hidden text-right text-xs text-[#717171] sm:block">
        {post.time}
      </time>
    </article>
  )
}

function Feed({ posts }: { posts: CommunityPost[] }) {
  return (
    <div className="mt-1" id="community-posts">
      {posts.map((post) => (
        <PostRow key={`${post.id}-${post.title}`} post={post} />
      ))}
    </div>
  )
}

function CommunitySection() {
  return (
    <section
      id="community"
        className="scroll-mt-24 bg-white pt-6"
      aria-labelledby="community-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 min-[744px]:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="community-heading" className="text-xl font-bold sm:text-2xl">
            社區正在發生
          </h2>
          <Button
            asChild
            variant="link"
            className="h-12 px-0 font-semibold text-primary"
          >
            <Link to="/community">
              進入社區
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="hot" className="gap-0">
          <TabsList
            variant="line"
            aria-label="社區貼文分類"
            className="h-12 gap-5 sm:gap-7"
          >
            <TabsTrigger
              value="latest"
              className="h-12 px-0 text-sm data-[state=active]:text-primary sm:text-base"
            >
              此刻提問
            </TabsTrigger>
            <TabsTrigger
              value="hot"
              className="h-12 px-0 text-sm data-[state=active]:text-primary sm:text-base"
            >
              本週最熱
            </TabsTrigger>
            <TabsTrigger
              value="unanswered"
              className="h-12 px-0 text-sm data-[state=active]:text-primary sm:text-base"
            >
              等你回答
            </TabsTrigger>
          </TabsList>

          {(Object.keys(feeds) as CommunityFeed[]).map((feed) => (
            <TabsContent key={feed} value={feed}>
              <Feed posts={feeds[feed]} />
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-center">
          <Button
            asChild
            variant="link"
            className="h-12 font-semibold text-primary"
          >
            <Link to="/community">
              查看全部熱門帖子
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CommunitySection
