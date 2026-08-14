import { Button } from '@react-monorepo/ui'
import { ChatCircleText, ThumbsUp } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import type { Guide } from '../../content/guides'

function GuideFeedback({ guide }: { guide: Guide }) {
  const [voted, setVoted] = useState(false)

  function handleHelpful(): void {
    if (voted) {
      return
    }

    setVoted(true)

    try {
      window.localStorage.setItem(`jikeyuan:guide-helpful:${guide.slug}`, 'true')
    } catch {
      // 無法寫入 localStorage 時只更新介面狀態。
    }

    toast('多謝你的回饋', {
      description: '你的回饋會幫助我們排出更實用的攻略。',
    })
  }

  return (
    <section
      aria-labelledby="guide-feedback-heading"
      className="rounded-[14px] border border-[#dddddd] p-5 min-[744px]:p-6"
    >
      <h2 id="guide-feedback-heading" className="text-sm font-semibold text-[#222222]">
        這篇攻略對你有幫助嗎？
      </h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          variant={voted ? 'default' : 'outline'}
          size="sm"
          className="h-10 rounded-lg px-4"
          aria-pressed={voted}
          onClick={handleHelpful}
        >
          <ThumbsUp size={16} weight={voted ? 'fill' : 'regular'} aria-hidden="true" />
          {voted ? '已記錄，多謝' : '有幫助'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 rounded-lg px-4 text-[#222222]"
          asChild
        >
          <Link to={`/questions/new?title=${encodeURIComponent(guide.cardTitle)}`}>
            <ChatCircleText size={16} weight="regular" aria-hidden="true" />
            還有疑問？去社區發問
          </Link>
        </Button>
      </div>
    </section>
  )
}

export default GuideFeedback
