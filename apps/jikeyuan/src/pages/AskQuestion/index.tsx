import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Alert,
  AlertDescription,
  Button,
  Input,
  Label,
  Progress,
  Separator,
  Switch,
  Textarea,
  Toaster,
} from '@react-monorepo/ui'
import {
  ArrowLeft,
  Camera,
  CaretRight,
  ChatCircleText,
  CheckCircle,
  EyeSlash,
  FloppyDisk,
  ImageSquare,
  PaperPlaneTilt,
  Sparkle,
  SpinnerGap,
  Trash,
  WarningCircle,
} from '@phosphor-icons/react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

// /questions/new is built as a state-driven handoff board: every screen state
// (initial, similar suggestions, uploading, validation, submitting, submit
// failed, unsaved-changes confirm) is reachable via the `?state=` query param,
// mirroring how the Community page exposes its states. The demo state switcher
// and `scenarioFor` wiring are review affordances — when a real submit API and
// the /questions/:questionId route land, the switcher is removed and the
// success path navigates to the new question instead of /community.

type AskState =
  | 'initial'
  | 'similar'
  | 'uploading'
  | 'validation'
  | 'submitting'
  | 'submit-failed'
  | 'unsaved'

const stateAliases: Record<string, AskState> = {
  initial: 'initial',
  similar: 'similar',
  uploading: 'uploading',
  validation: 'validation',
  submitting: 'submitting',
  'submit-failed': 'submit-failed',
  unsaved: 'unsaved',
}

const STATE_OPTIONS: Array<{ value: AskState; label: string }> = [
  { value: 'initial', label: '初始' },
  { value: 'similar', label: '相似建議' },
  { value: 'uploading', label: '圖片上傳中' },
  { value: 'validation', label: '驗證錯誤' },
  { value: 'submitting', label: '提交中' },
  { value: 'submit-failed', label: '提交失敗' },
  { value: 'unsaved', label: '離開未儲存' },
]

const CATEGORIES = ['入境升學', '租房住宿', '銀行貸款', '交通出行', '職場搵工', '校園生活']

const MAX_TITLE = 80
const MAX_DESC = 2000
const MAX_IMAGES = 4

const TIPS = [
  '寫清楚你嘅身份同地區，例如「港大新生、想住港島南」。',
  '一次集中問一個核心問題，答案會更精準。',
  '講低你已經試過嘅方法，避免重複建議。',
  '匿名發問一樣會收到學長姐嘅回覆。',
]

const SIMILAR_QUESTIONS = [
  { id: 1, title: '港大附近租樓，中介話免佣係咪有伏？', answers: 12 },
  { id: 2, title: '租樓按金通常係幾多個月？', answers: 8 },
  { id: 3, title: '學生簽租約要特別留意咩條款？', answers: 15 },
]

interface Scenario {
  title: string
  category: string | null
  description: string
  anonymous: boolean
}

function scenarioFor(state: AskState, prefillTitle: string): Scenario {
  switch (state) {
    case 'initial':
      return { title: prefillTitle, category: null, description: '', anonymous: false }
    case 'validation':
      return {
        title: '',
        category: null,
        description: '我係今年入學嘅內地新生，想喺港大附近租 studio，但唔知要點開始。',
        anonymous: false,
      }
    default:
      return {
        title: '港大附近租房有哪些坑？中介話免佣可信嗎？',
        category: '租房住宿',
        description:
          '我係今年入學嘅內地新生，想喺港大附近租 studio。地產話可以免佣，但要簽一年約、俾兩個月按金。呢個係咪正常？有冇伏？另外想知一般租約有咩條款要特別留意。',
        anonymous: false,
      }
  }
}

type ImageSlot =
  | { kind: 'done'; index: number }
  | { kind: 'uploading'; progress: number }
  | { kind: 'add' }

function imageSlotsFor(state: AskState): ImageSlot[] {
  switch (state) {
    case 'similar':
      return [{ kind: 'done', index: 1 }, { kind: 'add' }]
    case 'uploading':
      return [
        { kind: 'done', index: 1 },
        { kind: 'uploading', progress: 60 },
        { kind: 'add' },
      ]
    case 'submitting':
    case 'submit-failed':
    case 'unsaved':
      return [
        { kind: 'done', index: 1 },
        { kind: 'done', index: 2 },
        { kind: 'add' },
      ]
    default:
      return [{ kind: 'add' }]
  }
}

function StateSwitcher({
  current,
  onChange,
}: {
  current: AskState
  onChange: (next: AskState) => void
}) {
  return (
    <div className="border-b border-[#eeeeee] bg-[#fafafa]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-2 px-6 py-3 min-[744px]:px-8">
        <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#555555]">
          <Sparkle size={14} weight="fill" className="text-primary" />
          交接板預覽
        </span>
        {STATE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="xs"
            variant={current === option.value ? 'default' : 'outline'}
            className="h-7 rounded-full px-3"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

function SimilarSuggestions() {
  return (
    <div
      className="mt-3 rounded-[14px] border border-primary/20 bg-[#fff5f6] p-4"
      aria-label="可能已有答案的相似問題"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <ChatCircleText size={16} weight="fill" />
        可能已有答案
      </div>
      <p className="mt-1 text-xs text-[#717171]">先睇下呢幾條，避免重複發問。</p>
      <ul className="mt-2 space-y-0.5">
        {SIMILAR_QUESTIONS.map((question) => (
          <li key={question.id}>
            <button
              type="button"
              className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-2 text-left transition-colors hover:bg-white"
              onClick={() => toast.message(`已開啟：${question.title}`)}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm text-[#222222]">{question.title}</span>
                <span className="text-xs text-[#717171]">{question.answers} 個回答</span>
              </span>
              <CaretRight size={16} weight="regular" className="shrink-0 text-[#9f9f9f]" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ImageGrid({ slots }: { slots: ImageSlot[] }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="圖片上傳">
      {slots.map((slot, index) => {
        if (slot.kind === 'done') {
          return (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-[14px] bg-[#f1f1f1]"
            >
              <div className="flex size-full flex-col items-center justify-center text-[#9f9f9f]">
                <ImageSquare size={28} weight="duotone" />
                <span className="mt-1 text-[10px]">圖片 {slot.index}</span>
              </div>
              <button
                type="button"
                aria-label={`移除圖片 ${slot.index}`}
                className="absolute right-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75"
                onClick={() => toast.message('已移除圖片（預覽）')}
              >
                <Trash size={14} weight="regular" />
              </button>
            </div>
          )
        }

        if (slot.kind === 'uploading') {
          return (
            <div
              key={index}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-[14px] border border-[#dddddd] bg-[#fafafa] p-3 text-center"
            >
              <SpinnerGap size={22} weight="regular" className="animate-spin text-primary" />
              <Progress value={slot.progress} className="h-1.5" />
              <span className="text-[11px] text-[#717171]">上傳中 {slot.progress}%</span>
            </div>
          )
        }

        return (
          <button
            key={index}
            type="button"
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[14px] border border-dashed border-[#dddddd] text-[#717171] transition hover:border-primary hover:text-primary"
            onClick={() => toast.message('已加入圖片（預覽）')}
          >
            <Camera size={22} weight="regular" />
            <span className="text-[11px]">新增圖片</span>
          </button>
        )
      })}
    </div>
  )
}

function TipsRail() {
  return (
    <aside className="hidden w-[260px] shrink-0 lg:block" aria-label="好問題小貼士">
      <section className="rounded-[14px] border border-[#dddddd] p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkle size={18} weight="fill" className="text-primary" />
          好問題小貼士
        </div>
        <ul className="mt-3 space-y-2.5 text-xs leading-5 text-[#555555]">
          {TIPS.map((tip) => (
            <li key={tip} className="flex gap-2">
              <CheckCircle size={15} weight="regular" className="mt-0.5 shrink-0 text-primary" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <p className="text-xs leading-5 text-[#717171]">
          你嘅問題會喺社區公開，俾同路人見到。匿名發問可以保護隱私。
        </p>
      </section>
    </aside>
  )
}

function AskQuestion() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const requestedState = searchParams.get('state') ?? 'initial'
  const state = stateAliases[requestedState] ?? 'initial'
  const prefillTitle = searchParams.get('title') ?? ''

  const initialScenario = scenarioFor(state, prefillTitle)
  const [title, setTitle] = useState(initialScenario.title)
  const [category, setCategory] = useState<string | null>(initialScenario.category)
  const [description, setDescription] = useState(initialScenario.description)
  const [anonymous, setAnonymous] = useState(initialScenario.anonymous)

  function go(next: AskState) {
    const nextScenario = scenarioFor(next, prefillTitle)
    setTitle(nextScenario.title)
    setCategory(nextScenario.category)
    setDescription(nextScenario.description)
    setAnonymous(nextScenario.anonymous)

    if (next === 'initial') {
      setSearchParams(prefillTitle ? { title: prefillTitle } : {})
    } else {
      setSearchParams({ state: next })
    }
  }

  function simulateSubmit() {
    go('submitting')
    window.setTimeout(() => {
      toast.success('問題已發佈', { icon: <CheckCircle size={16} weight="fill" /> })
      // Real flow navigates to /questions/:questionId once that route exists.
      navigate('/community')
    }, 1400)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !category) {
      go('validation')
      return
    }
    simulateSubmit()
  }

  function handleCancel() {
    if (hasContent) {
      go('unsaved')
    } else {
      navigate('/community')
    }
  }

  function handleSaveDraft() {
    toast.success('草稿已儲存', { icon: <FloppyDisk size={16} weight="fill" /> })
  }

  const showSimilar = title.trim().length > 0
  const titleError = state === 'validation' && title.trim().length === 0
  const categoryError = state === 'validation' && !category
  const isSubmitting = state === 'submitting'
  const isFailed = state === 'submit-failed'
  const imageSlots = imageSlotsFor(state)
  const hasContent =
    title.trim().length > 0 ||
    description.trim().length > 0 ||
    imageSlots.some((slot) => slot.kind !== 'add')

  return (
    <main className="min-h-[calc(100dvh-65px)] bg-white pb-28 lg:pb-0">
      <StateSwitcher current={state} onChange={go} />

      <div className="mx-auto max-w-[1200px] px-6 py-7 min-[744px]:px-8 min-[744px]:py-8">
        <nav aria-label="路徑" className="flex items-center gap-1 text-xs text-[#717171]">
          <Link to="/community" className="inline-flex min-h-9 items-center hover:text-primary">
            社區
          </Link>
          <CaretRight size={12} weight="regular" className="text-[#bdbdbd]" />
          <span className="inline-flex min-h-9 items-center text-[#222222]">發問</span>
        </nav>

        <header className="mt-2 flex items-start gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="mt-1 size-9 shrink-0 rounded-full"
            aria-label="返回"
            onClick={handleCancel}
          >
            <ArrowLeft size={18} weight="regular" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em] sm:text-[28px]">提出問題</h1>
            <p className="mt-1 text-sm text-[#717171]">問得準，學長姐先答得準。</p>
          </div>
        </header>

        <div className="mt-6 flex gap-7">
          <form
            id="ask-form"
            className="min-w-0 flex-1 lg:max-w-[720px]"
            onSubmit={handleSubmit}
            noValidate
          >
            {isFailed && (
              <Alert className="mb-5 flex items-center gap-3 rounded-lg border-primary/30 bg-[#fff5f6] pr-3 text-primary">
                <WarningCircle size={18} weight="fill" />
                <AlertDescription className="flex-1 text-sm text-[#b4233e]">
                  發佈失敗，你寫嘅內容已經保留。檢查網絡後再試一次。
                </AlertDescription>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 rounded-lg border-primary text-primary"
                  onClick={simulateSubmit}
                >
                  再試一次
                </Button>
              </Alert>
            )}

            <div>
              <Label htmlFor="ask-title" className="text-sm font-semibold text-[#222222]">
                問題標題 <span className="text-primary">*</span>
              </Label>
              <Input
                id="ask-title"
                value={title}
                onChange={(event) => setTitle(event.target.value.slice(0, MAX_TITLE))}
                placeholder="你想問咩？例如：港大附近租房有哪些坑？"
                aria-invalid={titleError}
                aria-describedby="ask-title-count"
                disabled={isSubmitting}
                className="mt-2 h-12 rounded-lg border-[#dddddd] bg-white text-base shadow-none focus-visible:border-primary focus-visible:ring-primary/25 aria-[invalid=true]:border-[#b4233e] aria-[invalid=true]:ring-[#b4233e]/15"
              />
              <div className="mt-1.5 flex items-center justify-between gap-3">
                {titleError ? (
                  <p className="flex items-center gap-1 text-xs text-[#b4233e]" role="alert">
                    <WarningCircle size={13} weight="fill" />
                    寫低你嘅問題，其他人先幫到你。
                  </p>
                ) : (
                  <span className="text-xs text-[#9f9f9f]">清楚、具體嘅標題會引到啱嘅人。</span>
                )}
                <span id="ask-title-count" className="shrink-0 text-xs text-[#9f9f9f]">
                  {title.length} / {MAX_TITLE}
                </span>
              </div>
              {showSimilar && <SimilarSuggestions />}
            </div>

            <div className="mt-6">
              <Label className="text-sm font-semibold text-[#222222]">
                分類 <span className="text-primary">*</span>
              </Label>
              <div
                className="horizontal-scroll mt-2 flex flex-wrap gap-2"
                role="group"
                aria-label="選擇分類"
              >
                {CATEGORIES.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    variant={category === item ? 'default' : 'outline'}
                    size="sm"
                    aria-pressed={category === item}
                    disabled={isSubmitting}
                    className="h-9 shrink-0 rounded-full px-4 text-sm"
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
              {categoryError && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-[#b4233e]" role="alert">
                  <WarningCircle size={13} weight="fill" />
                  揀一個分類，等啱嘅人搵到你。
                </p>
              )}
            </div>

            <div className="mt-6">
              <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor="ask-desc" className="text-sm font-semibold text-[#222222]">
                  詳細描述
                </Label>
                <span
                  className={`shrink-0 text-xs ${description.length > MAX_DESC ? 'text-[#b4233e]' : 'text-[#9f9f9f]'}`}
                >
                  {description.length} / {MAX_DESC}
                </span>
              </div>
              <Textarea
                id="ask-desc"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="補充細節：你嘅身份、地區、已經試過咩、想達到咩目標。"
                disabled={isSubmitting}
                className="mt-2 min-h-[128px] rounded-lg border-[#dddddd] bg-white text-sm leading-6 shadow-none focus-visible:border-primary focus-visible:ring-primary/25"
              />
            </div>

            <div className="mt-6">
              <Label className="text-sm font-semibold text-[#222222]">
                圖片 <span className="text-[#9f9f9f]">（選填，最多 {MAX_IMAGES} 張）</span>
              </Label>
              <ImageGrid slots={imageSlots} />
              <p className="mt-2 text-xs text-[#9f9f9f]">支援 JPG、PNG，每張最大 5MB。</p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-[14px] border border-[#eeeeee] bg-[#fafafa] p-4">
              <div className="flex items-start gap-3">
                <EyeSlash size={20} weight="regular" className="mt-0.5 text-[#555555]" />
                <div>
                  <Label htmlFor="ask-anon" className="text-sm font-semibold text-[#222222]">
                    匿名發問
                  </Label>
                  <p className="mt-0.5 text-xs text-[#717171]">你嘅名唔會顯示，學長姐一樣會答。</p>
                </div>
              </div>
              <Switch
                id="ask-anon"
                checked={anonymous}
                onCheckedChange={setAnonymous}
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-7 hidden items-center justify-between border-t border-[#eeeeee] pt-5 lg:flex">
              <Button
                type="button"
                variant="link"
                className="h-11 px-0 text-[#555555]"
                onClick={handleCancel}
              >
                取消
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-lg px-5"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                >
                  <FloppyDisk size={16} weight="regular" />
                  儲存草稿
                </Button>
                <Button type="submit" className="h-11 rounded-lg px-6" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <SpinnerGap className="animate-spin" />
                  ) : (
                    <PaperPlaneTilt size={16} weight="fill" />
                  )}
                  {isSubmitting ? '發佈中…' : '發佈問題'}
                </Button>
              </div>
            </div>
          </form>

          <TipsRail />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#eeeeee] bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0 rounded-full"
            aria-label="儲存草稿"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            <FloppyDisk size={18} weight="regular" />
          </Button>
          <Button
            type="submit"
            form="ask-form"
            className="h-11 flex-1 rounded-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <SpinnerGap className="animate-spin" />
            ) : (
              <PaperPlaneTilt size={16} weight="fill" />
            )}
            {isSubmitting ? '發佈中…' : '發佈問題'}
          </Button>
        </div>
      </div>

      <AlertDialog open={state === 'unsaved'} onOpenChange={(open) => !open && go('similar')}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>你有未發佈嘅內容</AlertDialogTitle>
            <AlertDialogDescription>
              而家離開會失去呢次嘅草稿（除非你已經儲存）。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="default" className="h-10 rounded-lg">
              繼續編輯
            </AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              className="h-10 rounded-lg text-[#555555]"
              onClick={() => navigate('/community')}
            >
              放棄
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="top-center" />
    </main>
  )
}

export default AskQuestion
