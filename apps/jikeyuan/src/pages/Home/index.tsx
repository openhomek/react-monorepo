import { Button, Input } from '@react-monorepo/ui'
import {
  Clock3,
  Icon,
  SendHorizontal,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import heroImage from '../../assets/images/hero.png'
import passportIcon from '../../assets/icons/icon-entry-documents.svg'
import rentHouseIcon from '../../assets/icons/icon-rent-housing.svg'
import paymentIcon from '../../assets/icons/icon-bank-payment.svg'
import transportIcon from '../../assets/icons/icon-transit.svg'
import networkIcon   from '../../assets/icons/icon-phone-network.svg'
import campusIcon from '../../assets/icons/icon-campus-life.svg'
const categoryItems = [
  {
    label: '入境證件',
    Icon: passportIcon,
  },
  {
    label: '租房住宿',
    Icon: rentHouseIcon,
  },
  {
    label: '銀行支付',
    Icon: paymentIcon,
  },
  {
    label: '交通出行',
    Icon: transportIcon,
  },
  {
    label: '電話網絡',
    Icon: networkIcon,
  },
  {
    label: '校園生活',
    Icon:   campusIcon,
  },
]

function Home() {
  /*
   * question 管理输入框内容。
   *
   * 输入框显示什么，由 React 状态决定；
   * 用户输入时，再通过 onChange 把新内容同步回来。
   */
  const [question, setQuestion] = useState('')

  /*
   * feedback 单独管理提交结果。
   *
   * 不把反馈和问题放在同一个状态中，是因为它们变化的原因不同：
   * question 因为用户输入而变化，feedback 因为提交结果而变化。
   */
  const [feedback, setFeedback] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    /*
     * 浏览器默认提交表单会刷新页面。
     *
     * 这个页面由 React 管理，刷新会让 question 和 feedback 全部丢失，
     * 所以阻止默认刷新，由 React 自己完成验证和反馈。
     */
    event.preventDefault()

    /*
     * 先清理再验证。
     *
     * 用户只输入空格时，看起来输入框有内容，
     * 但它并不是一个真正的问题，所以先去掉首尾空格。
     */
    const normalizedQuestion = question.trim()

    if (normalizedQuestion.length === 0) {
      setFeedback('請先輸入你想問的問題')
      return
    }

    /*
     * 当前没有连接后端，只模拟成功状态。
     *
     * 将来接入 API 时，这个分支会变成：
     * 开始加载 → 调用 API → 根据结果更新反馈。
     */
    setFeedback(`已記錄問題：「${normalizedQuestion}」`)
  }

  return (
    <main>
      {/*Hero
       */}
      <section className="mx-auto grid min-h-[560px] max-w-[1200px] items-center gap-12 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr]">
      
        <div className="max-w-[560px]">
          <p className="mb-5 font-semibold text-primary">
            給每個剛到香港的人
          </p>

          <h1 className="text-4xl leading-[1.18] font-bold tracking-[-0.035em] sm:text-5xl">
            有問題，就問走過
            <br />
            同一段路的人
          </h1>
          <p className="mt-6 max-w-[500px] text-lg leading-8 text-[#6a6a6a]">
            無論入學、租房、搵工定生活大小事，
            <br className="hidden sm:block" />
            在港伴社區找到同校、同城、同路的幫手。
          </p>
          <form
            className="mt-9 flex max-w-[540px] items-center rounded-full border border-[#dddddd] bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/20"
            onSubmit={handleSubmit}
          >
            <Input
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value)

                /*
                 * 用户开始修改问题，旧反馈就不再代表当前内容。
                 *
                 * 立即清除旧反馈，避免用户把上一次成功消息
                 * 误认为当前问题也已经提交。
                 */
                setFeedback('')
              }}
              placeholder="例如：港大附近租房有哪些坑？"
              aria-label="輸入問題"
              className="h-12 flex-1 border-0 bg-transparent px-5 shadow-none focus-visible:ring-0"
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

          {/*
           * 布局思路：响应时间是降低用户提交顾虑的辅助信息。
           *
           * 它紧跟在表单下方，让用户在决定是否提问时马上看到；
           * 使用 Flex 让图标和文字形成一行；
           * 灰色和小字号保持辅助层级，不抢表单的注意力。
           */}
          <div className="mt-5 flex items-center gap-2 text-sm text-[#6a6a6a]">
            <Clock3 className="size-4" />
            <span>通常 10 分鐘內會有同學回覆</span>
          </div>

          {/*
           * 如果只在有消息时创建元素，提交后页面高度会突然变化，
           * 用户会看到内容向下跳动。
           * min-h-6 保留稳定空间；
           * aria-live 让辅助技术能读出动态提交结果。
           */}
          <p
            className="mt-3 min-h-6 text-sm font-medium text-primary"
            aria-live="polite"
          >
            {feedback}
          </p>
        </div>

        <div className="flex min-h-[430px] items-center justify-center rounded-[32px] bg-[#ffffff] p-8">
          {/*
           * object-contain 保证插画完整显示。
           *
           * 这里不使用 object-cover，因为 cover 会为了铺满容器而裁切图片，
           * 人物、建筑或说明元素可能被切掉。
           *
           * 最大高度限制为 440px，防止原图尺寸过大时反过来撑高 Hero。
           */}
          <img
            src={heroImage}
            alt="港伴社區交流與香港生活服務插畫"
            className="max-h-[440px] w-full object-contain"
            draggable='false'
          />
        </div>
      </section>

      <section className="border-y border-[#eeeeee] bg-[#fdfdfd]">

        <div className="mx-auto max-w-[1200px] px-6 py-8">
          <h2 className="text-lg font-bold">你現在需要什麼？</h2>

          <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
            {categoryItems.map((item) => {
                
              return (
                <Button
                  key={item.label}
                  type="button"
                  variant="outline"
                  className="h-14 shrink-0 rounded-full border-[#dddddd] bg-white px-5 shadow-sm hover:border-primary hover:bg-[#fff7f8]"
                >
                  <img 
                  src={item.Icon}
                  alt=''
                  aria-hidden='true'
                  className='size-13 shrink-0 object-contain'
                  draggable='false'
                  />
                  {item.label}  
                </Button>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home