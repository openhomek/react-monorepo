import { Button, Input } from '@react-monorepo/ui'
import { Clock3, SendHorizontal } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import CommunitySection from '../../components/home/CommunitySection'
import GuideSection from '../../components/home/GuideSection'
import campusIcon from '../../assets/icons/icon-campus-life.svg'
import passportIcon from '../../assets/icons/icon-entry-documents.svg'
import paymentIcon from '../../assets/icons/icon-bank-payment.svg'
import networkIcon from '../../assets/icons/icon-phone-network.svg'
import rentHouseIcon from '../../assets/icons/icon-rent-housing.svg'
import transportIcon from '../../assets/icons/icon-transit.svg'
import heroImage from '../../assets/images/hero.png'

const categoryItems = [
  { label: '入境證件', icon: passportIcon },
  { label: '租房住宿', icon: rentHouseIcon },
  { label: '銀行支付', icon: paymentIcon },
  { label: '交通出行', icon: transportIcon },
  { label: '電話網絡', icon: networkIcon },
  { label: '校園生活', icon: campusIcon },
]

function Home() {
  const [question, setQuestion] = useState('')
  const [feedback, setFeedback] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedQuestion = question.trim()

    if (normalizedQuestion.length === 0) {
      setFeedback('請先輸入你想問的問題')
      return
    }

    setFeedback(`已記錄問題：「${normalizedQuestion}」`)
  }

  function handleCategorySelect(label: string) {
    setQuestion(`${label}：`)
    setFeedback('')

    requestAnimationFrame(() => {
      document.querySelector<HTMLInputElement>('#question-input')?.focus()
    })
  }

  return (
    <main className="overflow-x-clip">
      <section className="mx-auto grid min-h-[535px] max-w-[1200px] items-center gap-8 px-6 py-10 min-[744px]:grid-cols-[0.95fr_1.05fr] min-[744px]:px-8 min-[744px]:py-12 lg:gap-12">
        <div className="max-w-[560px]">
          <p className="mb-4 text-sm font-semibold text-primary sm:text-base">
            給每個剛到香港的人
          </p>

          <h1 className="text-[34px] leading-[1.18] font-bold tracking-[-0.035em] sm:text-[40px] lg:text-5xl">
            有問題，就問走過
            <br />
            同一段路的人
          </h1>
          <p className="mt-5 max-w-[500px] text-base leading-7 text-[#5f5f5f] lg:text-lg lg:leading-8">
            無論入學、租房、搵工定生活大小事，
            <br className="hidden sm:block" />
            在有解社區找到同校、同城、同路的幫手。
          </p>

          <form
            id="question-form"
            className="mt-7 flex max-w-[540px] scroll-mt-28 items-center rounded-full border border-[#dddddd] bg-white p-2 shadow-[0_10px_26px_rgba(0,0,0,0.08)] transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/20"
            onSubmit={handleSubmit}
          >
            <Input
              id="question-input"
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value)
                setFeedback('')
              }}
              placeholder="例如：港大附近租房有哪些坑？"
              aria-label="輸入問題"
              className="h-12 flex-1 border-0 bg-transparent px-4 text-sm shadow-none focus-visible:ring-0 sm:px-5 sm:text-base"
            />

            <Button
              type="submit"
              size="icon"
              className="size-12 shrink-0 rounded-full"
              aria-label="提交問題"
            >
              <SendHorizontal />
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-2 text-xs text-[#666666] sm:text-sm">
            <Clock3 className="size-4" />
            <span>通常 10 分鐘內會有同學回覆</span>
          </div>

          <p
            className="mt-2 min-h-5 text-sm font-medium text-primary"
            aria-live="polite"
          >
            {feedback}
          </p>
        </div>

        <div className="flex min-h-[280px] items-center justify-center min-[744px]:min-h-[390px]">
          <img
            src={heroImage}
            alt="有解社區交流與香港生活服務插畫"
            className="max-h-[430px] w-full object-contain min-[744px]:scale-[1.24]"
            draggable="false"
          />
        </div>
      </section>

      <section
        id="categories"
        className="scroll-mt-24 border-y border-[#eeeeee] bg-[#fdfdfd]"
        aria-labelledby="categories-heading"
      >
        <div className="mx-auto max-w-[1200px] px-6 py-[23px] min-[744px]:px-8">
          <h2 id="categories-heading" className="text-base font-bold sm:text-lg">
            你現在需要什麼？
          </h2>

          <div className="horizontal-scroll mt-2 flex gap-3 overflow-x-auto pb-1">
            {categoryItems.map((item) => (
              <Button
                key={item.label}
                type="button"
                variant="outline"
                className="h-[52px] shrink-0 rounded-full border-[#dddddd] bg-white px-2 text-[13px] shadow-sm hover:border-primary hover:bg-[#fff7f8]"
                onClick={() => handleCategorySelect(item.label)}
              >
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  className="size-7 shrink-0 object-contain"
                  draggable="false"
                />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <CommunitySection />
      <GuideSection />
    </main>
  )
}

export default Home
