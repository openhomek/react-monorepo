import { Badge, Button, Separator } from '@react-monorepo/ui'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getGuideBySlug, guides } from '../../content/guides'

function Guide() {
  const { slug } = useParams()
  const guide = getGuideBySlug(slug)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  if (guide === undefined) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-3 text-3xl font-bold">找不到這篇攻略</h1>
        <p className="mt-3 max-w-lg leading-7 text-[#666666]">
          這篇內容可能尚未發布或網址已經變更。你可以返回首頁查看已核實的攻略。
        </p>
        <Button asChild className="mt-7 rounded-full px-6">
          <Link to="/#guides">
            <ArrowLeft />
            返回新生攻略
          </Link>
        </Button>
      </main>
    )
  }

  const relatedGuides = guides.filter((item) => item.slug !== guide.slug)

  return (
    <main className="bg-white">
      <article>
        <header className="border-b border-[#eeeeee] bg-[#fffaf8]">
          <div className="mx-auto max-w-[920px] px-6 py-10 min-[744px]:px-8 min-[744px]:py-14">
            <nav aria-label="麵包屑" className="flex flex-wrap items-center gap-2 text-sm text-[#666666]">
              <Link to="/" className="hover:text-primary">首頁</Link>
              <span aria-hidden="true">/</span>
              <Link to="/#guides" className="hover:text-primary">新生攻略</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-[#333333]">{guide.category}</span>
            </nav>

            <Badge className="mt-7 rounded-full bg-[#ffe5ea] px-3 py-1 text-primary">
              {guide.category}
            </Badge>
            <h1 className="mt-4 max-w-[820px] text-[32px] leading-[1.2] font-bold tracking-[-0.03em] sm:text-[42px]">
              {guide.title}
            </h1>
            <p className="mt-5 max-w-[780px] text-base leading-8 text-[#5f5f5f] sm:text-lg">
              {guide.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#666666]">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4" />
                最後核實：<time dateTime={guide.reviewedDate}>{guide.reviewedDate}</time>
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="size-4" />
                {guide.readingTime}
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4" />
                有解編輯部整理
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[920px] px-6 py-10 min-[744px]:px-8 min-[744px]:py-14">
          <section aria-labelledby="guide-summary-heading" className="rounded-2xl border border-[#ffd1d9] bg-[#fff7f8] p-6 sm:p-8">
            <h2 id="guide-summary-heading" className="text-xl font-bold">先看重點</h2>
            <ul className="mt-4 space-y-3">
              {guide.takeaways.map((takeaway) => (
                <li key={takeaway} className="flex gap-3 leading-7 text-[#444444]">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-12 space-y-12">
            {guide.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl leading-9 font-bold tracking-[-0.02em]">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-8 text-[#4f4f4f]">
                    {paragraph}
                  </p>
                ))}
                {section.checklist && (
                  <ul className="mt-5 space-y-3 rounded-xl bg-[#f7f7f7] p-5 sm:p-6">
                    {section.checklist.map((item) => (
                      <li key={item} className="flex gap-3 leading-7 text-[#444444]">
                        <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.note && (
                  <p className="mt-5 border-l-4 border-primary bg-[#fff7f8] px-5 py-4 leading-7 text-[#555555]">
                    <strong className="text-[#333333]">注意：</strong>{section.note}
                  </p>
                )}
              </section>
            ))}
          </div>

          <Separator className="my-12" />

          <section aria-labelledby="guide-sources-heading">
            <h2 id="guide-sources-heading" className="text-2xl font-bold">官方資料來源</h2>
            <p className="mt-3 leading-7 text-[#666666]">
              本文最後於 {guide.reviewedDate} 核對。政策、資格、費用和服務安排可能更新，辦理前請再次查閱以下官方頁面。
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {guide.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-full items-start justify-between gap-4 rounded-xl border border-[#dddddd] p-4 transition-colors hover:border-primary hover:text-primary"
                  >
                    <span>
                      <span className="block font-semibold">{source.label}</span>
                      <span className="mt-1 block text-sm text-[#777777]">{source.organization}</span>
                    </span>
                    <ExternalLink className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-8 rounded-xl bg-[#f7f7f7] px-5 py-4 text-sm leading-6 text-[#666666]">
            本文提供一般資料整理，不構成法律、移民或財務意見。個人情況不同，應以主管部門、院校、服務機構或合資格專業人士的最新答覆為準。
          </p>
        </div>
      </article>

      <aside aria-labelledby="related-guides-heading" className="border-t border-[#eeeeee] bg-[#faf9f7]">
        <div className="mx-auto max-w-[920px] px-6 py-10 min-[744px]:px-8 min-[744px]:py-12">
          <h2 id="related-guides-heading" className="text-2xl font-bold">接著閱讀</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {relatedGuides.map((item) => (
              <Link
                key={item.slug}
                to={item.path}
                className="group rounded-xl border border-[#dddddd] bg-white p-5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-primary"
              >
                <span className="text-xs font-semibold text-primary">{item.category}</span>
                <h3 className="mt-2 font-semibold leading-7">{item.cardTitle}</h3>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  閱讀攻略
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </main>
  )
}

export default Guide
