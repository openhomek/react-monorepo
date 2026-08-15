import { ArrowLeft, CloudX, SpinnerGap } from '@phosphor-icons/react'
import { Button, Toaster } from '@react-monorepo/ui'
import { Theme } from '@astryxdesign/core'
import axios from 'axios'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { fetchGuideBySlug } from '../../apis/guides'
import GuideAside, { GuideEditorCard, GuideRating, GuideShare, type GuideTocItem } from '../../components/guide/GuideAside'
import GuideCover from '../../components/guide/GuideCover'
import GuideFaq from '../../components/guide/GuideFaq'
import GuideHeader from '../../components/guide/GuideHeader'
import GuidePromoBanner from '../../components/guide/GuidePromoBanner'
import GuideSection from '../../components/guide/GuideSection'
import GuideSources from '../../components/guide/GuideSources'
import RelatedGuides from '../../components/guide/RelatedGuides'
import { getGuideBySlug, type Guide } from '../../content/guides'
import { airbnbTheme } from '../../theme/airbnb.theme'

type RemoteGuideState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'loaded'; guide: Guide }
  | { phase: 'not-found' }
  | { phase: 'error' }

function Guide() {
  const { slug } = useParams()
  const staticGuide = getGuideBySlug(slug)
  const [remoteState, setRemoteState] = useState<RemoteGuideState>({ phase: 'idle' })

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  const loadRemote = useCallback(async () => {
    if (slug === undefined) {
      setRemoteState({ phase: 'not-found' })
      return
    }
    setRemoteState({ phase: 'loading' })
    try {
      const guide = await fetchGuideBySlug(slug)
      setRemoteState({ phase: 'loaded', guide })
      document.title = `${guide.title}｜有解`
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setRemoteState({ phase: 'not-found' })
      } else {
        setRemoteState({ phase: 'error' })
      }
    }
  }, [slug])

  useEffect(() => {
    if (staticGuide === undefined) {
      void loadRemote()
    } else {
      setRemoteState({ phase: 'idle' })
    }
  }, [staticGuide, loadRemote])

  if (remoteState.phase === 'loading') {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <SpinnerGap size={32} weight="regular" aria-hidden="true" className="animate-spin text-primary" />
        <p className="text-sm text-[#666666]">正在載入攻略…</p>
      </main>
    )
  }

  if (remoteState.phase === 'error') {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <CloudX size={52} weight="duotone" aria-hidden="true" className="text-[#929292]" />
        <h1 className="mt-4 text-2xl font-semibold">暫時載入不到這篇攻略</h1>
        <p className="mt-3 max-w-lg leading-7 text-[#666666]">可能是系統忙碌，請稍後再試。</p>
        <Button className="mt-7 rounded-full px-6" onClick={() => void loadRemote()}>
          重新載入
        </Button>
      </main>
    )
  }

  const guide = staticGuide ?? (remoteState.phase === 'loaded' ? remoteState.guide : undefined)

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

  const tocItems: GuideTocItem[] = guide.sections.map((section, index) => ({
    id: `guide-section-${index + 1}`,
    title: section.title,
  }))
  if (guide.faq !== undefined && guide.faq.length > 0) {
    tocItems.push({ id: 'guide-faq', title: '常見問題' })
  }
  tocItems.push({ id: 'guide-sources', title: '官方資料來源' })

  // 正文中段（第四節之後）放置 CTA Banner，位置會隨章節總數自然落於文章中間。
  const promoAfterIndex = Math.min(3, guide.sections.length - 1)

  return (
    <Theme theme={airbnbTheme}>
      <main className="bg-white">
        <article>
          <GuideHeader guide={guide} />
          <GuideCover guide={guide} />

          <div className="mx-auto max-w-[1200px] px-6 pb-16 min-[744px]:px-8">
            <div className="mt-8 grid min-[1128px]:grid-cols-[200px_minmax(0,680px)] min-[1128px]:justify-center min-[1128px]:gap-12">
              <GuideAside items={tocItems} guide={guide} />

              <div className="mt-8 min-w-0 max-w-[680px] min-[1128px]:mt-0">
                <div>
                  {guide.sections.map((section, index) => (
                    <Fragment key={section.title}>
                      <GuideSection
                        section={section}
                        index={index}
                        category={guide.category}
                      />
                      {index === promoAfterIndex && guide.promo !== undefined && (
                        <GuidePromoBanner promo={guide.promo} />
                      )}
                    </Fragment>
                  ))}
                </div>

                {guide.faq !== undefined && guide.faq.length > 0 && (
                  <div className="mt-12 min-[744px]:mt-14">
                    <GuideFaq items={guide.faq} />
                  </div>
                )}

                <div className="mt-12 min-[744px]:mt-14">
                  <GuideSources guide={guide} />
                </div>

                <div className="mt-10 min-[1128px]:hidden">
                  <GuideEditorCard />
                  <GuideRating guide={guide} className="mt-6 border-t border-[#ebebeb] pt-6" />
                  <GuideShare guide={guide} className="mt-6 border-t border-[#ebebeb] pt-6" />
                </div>
              </div>
            </div>
          </div>
        </article>

        <RelatedGuides guide={guide} />
        <Toaster position="top-center" />
      </main>
    </Theme>
  )
}

export default Guide
