import { ArrowLeft } from '@phosphor-icons/react'
import { Button } from '@react-monorepo/ui'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import GuideFaq from '../../components/guide/GuideFaq'
import GuideFeedback from '../../components/guide/GuideFeedback'
import GuideFreshness from '../../components/guide/GuideFreshness'
import GuideHeader from '../../components/guide/GuideHeader'
import GuideHero from '../../components/guide/GuideHero'
import GuideSection from '../../components/guide/GuideSection'
import GuideSources from '../../components/guide/GuideSources'
import GuideTakeaways from '../../components/guide/GuideTakeaways'
import GuideToc, { type GuideTocItem } from '../../components/guide/GuideToc'
import RelatedGuides from '../../components/guide/RelatedGuides'
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
          這篇內容可能尚未發布或網址已經變更。你可以返回攻略列表查看已核實的攻略。
        </p>
        <Button asChild className="mt-7 rounded-full px-6">
          <Link to="/guides">
            <ArrowLeft size={16} weight="regular" aria-hidden="true" />
            返回新生攻略
          </Link>
        </Button>
      </main>
    )
  }

  const relatedGuides = guides.filter((item) => item.slug !== guide.slug)
  const tocItems: GuideTocItem[] = guide.sections.map((section, index) => ({
    id: `guide-section-${index + 1}`,
    title: section.title,
  }))

  return (
    <main className="bg-white">
      <article>
        <GuideHero guide={guide} />
        <GuideHeader guide={guide} />

        <div className="mx-auto max-w-[1200px] px-6 pb-16 min-[744px]:px-8">
          <div className="mt-8 grid min-[1128px]:grid-cols-[240px_minmax(0,1fr)] min-[1128px]:gap-14">
            <GuideToc items={tocItems} />

            <div className="mt-8 min-w-0 max-w-[720px] min-[1128px]:mt-0">
              <GuideTakeaways items={guide.takeaways} />

              <div className="mt-12 space-y-12 min-[744px]:space-y-16">
                {guide.sections.map((section, index) => (
                  <GuideSection
                    key={section.title}
                    section={section}
                    index={index}
                    category={guide.category}
                  />
                ))}
              </div>

              {guide.faq !== undefined && guide.faq.length > 0 && (
                <div className="mt-12 min-[744px]:mt-16">
                  <GuideFaq items={guide.faq} />
                </div>
              )}

              <div className="mt-12 space-y-4 min-[744px]:mt-16">
                <GuideSources guide={guide} />
                <GuideFreshness reviewedDate={guide.reviewedDate} />
                <GuideFeedback guide={guide} />
              </div>
            </div>
          </div>
        </div>
      </article>

      <RelatedGuides items={relatedGuides} />
    </main>
  )
}

export default Guide
