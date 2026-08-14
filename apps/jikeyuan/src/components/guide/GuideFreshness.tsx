import { Button } from '@react-monorepo/ui'
import { Flag, SealCheck } from '@phosphor-icons/react'
import { toast } from 'sonner'

const OUTDATED_REPORT_KEY = 'jikeyuan:guide-outdated-report'

function GuideFreshness({ reviewedDate }: { reviewedDate: string }) {
  function handleReport(): void {
    try {
      window.localStorage.setItem(
        OUTDATED_REPORT_KEY,
        JSON.stringify({ reviewedDate, reportedAt: new Date().toISOString() }),
      )
    } catch {
      // 私密模式等無法寫入 localStorage 的情況下靜靜略過，仍給予回覆。
    }

    toast('多謝回報', {
      description: '編輯部會定期核實攻略內容，更新後會再標示新的核實日期。',
    })
  }

  return (
    <section
      aria-labelledby="guide-freshness-heading"
      className="rounded-[14px] border border-[#dddddd] p-5 min-[744px]:p-6"
    >
      <div className="flex flex-col gap-4 min-[744px]:flex-row min-[744px]:items-center min-[744px]:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff7f8]">
            <SealCheck size={22} weight="fill" aria-hidden="true" className="text-primary" />
          </span>
          <div>
            <h2 id="guide-freshness-heading" className="text-sm font-semibold text-[#222222]">
              本文最後核實於 <time dateTime={reviewedDate}>{reviewedDate}</time>
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#6a6a6a]">
              有解編輯部對照官方資料核實高風險資訊（流程、費用、文件）；辦理前請再查閱上方官方頁面。
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 shrink-0 rounded-lg px-4"
          onClick={handleReport}
        >
          <Flag size={14} weight="regular" aria-hidden="true" />
          資料過期？回報
        </Button>
      </div>
    </section>
  )
}

export default GuideFreshness
