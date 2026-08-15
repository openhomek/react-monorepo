import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { getGuideByPath, guides, type Guide } from '../../content/guides'

interface PageMetadata {
  title: string
  description: string
  canonicalPath: string
  indexable: boolean
  schemaType?: 'WebPage' | 'CollectionPage' | 'Article'
  article?: Guide
}

const pageMetadata: Record<string, PageMetadata> = {
  '/': {
    title: '香港新生攻略與生活問答｜有解',
    description:
      '有解為剛到香港的學生與新來港人士整理入境、租房、銀行開戶、交通、電話網絡及校園生活攻略，亦可向走過同一段路的人發問。',
    canonicalPath: '/',
    indexable: true,
    schemaType: 'WebPage',
  },
  '/community': {
    title: '香港生活社區問答｜租房、銀行開戶、交通與校園｜有解',
    description:
      '搜尋香港租房、銀行開戶、八達通、學生簽證及校園生活問題，參考同校、同城、同路人的實際經驗，找不到答案也可直接發問。',
    canonicalPath: '/community',
    indexable: true,
    schemaType: 'CollectionPage',
  },
  '/guides': {
    title: '香港生活攻略｜入境、租房、交通與銀行｜有解',
    description:
      '按任務分類的香港新生與生活攻略：入境證件、租房住宿、銀行支付、交通出行、電話網絡及校園生活，每篇都標示最後核實日期。',
    canonicalPath: '/guides',
    indexable: true,
    schemaType: 'CollectionPage',
  },
  '/login': {
    title: '登入｜有解',
    description: '登入有解帳戶，繼續收藏香港生活攻略及參與社區問答。',
    canonicalPath: '/login',
    indexable: false,
  },
  '/register': {
    title: '建立帳戶｜有解',
    description: '建立有解帳戶，收藏香港生活攻略並向社區提問。',
    canonicalPath: '/register',
    indexable: false,
  },
}

function resolvePageMetadata(pathname: string): PageMetadata {
  const guide = getGuideByPath(pathname)

  if (guide) {
    return {
      title: `${guide.title}｜有解`,
      description: guide.description,
      canonicalPath: guide.path,
      indexable: true,
      schemaType: 'Article',
      article: guide,
    }
  }

  return pageMetadata[pathname] ?? {
    title: '找不到頁面｜有解',
    description: '你所尋找的有解頁面不存在。',
    canonicalPath: pathname,
    indexable: false,
  }
}

function setNamedMeta(name: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)

  if (element === null) {
    element = document.createElement('meta')
    element.name = name
    document.head.append(element)
  }

  element.content = content
}

function removeNamedMeta(name: string): void {
  document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.remove()
}

function setPropertyMeta(property: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)

  if (element === null) {
    element = document.createElement('meta')
    element.setAttribute('property', property)
    document.head.append(element)
  }

  element.content = content
}

function removePropertyMeta(property: string): void {
  document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)?.remove()
}

function setCanonical(href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (element === null) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.append(element)
  }

  element.href = href
}

function getSiteOrigin(): string {
  const configuredOrigin = import.meta.env.VITE_SITE_URL?.trim()

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, '')
  }

  return window.location.origin
}

function SeoMetadata() {
  const location = useLocation()

  useEffect(() => {
    const metadata = resolvePageMetadata(location.pathname)
    const searchParams = new URLSearchParams(location.search)
    const isNoncanonicalQuery =
      (location.pathname === '/community' && searchParams.has('state')) ||
      (location.pathname === '/guides' && searchParams.size > 0)
    const isIndexable = metadata.indexable && !isNoncanonicalQuery
    const siteOrigin = getSiteOrigin()
    const canonicalUrl = `${siteOrigin}${metadata.canonicalPath}`

    document.documentElement.lang = 'zh-Hant-HK'
    document.title = metadata.title
    setNamedMeta('description', metadata.description)
    setNamedMeta('robots', isIndexable ? 'index, follow' : 'noindex, follow')
    setNamedMeta('googlebot', isIndexable ? 'index, follow' : 'noindex, follow')
    setCanonical(canonicalUrl)
    setPropertyMeta('og:type', metadata.schemaType === 'Article' ? 'article' : 'website')
    setPropertyMeta('og:locale', 'zh_HK')
    setPropertyMeta('og:site_name', '有解')
    setPropertyMeta('og:title', metadata.title)
    setPropertyMeta('og:description', metadata.description)
    setPropertyMeta('og:url', canonicalUrl)
    setNamedMeta('twitter:card', 'summary')
    setNamedMeta('twitter:title', metadata.title)
    setNamedMeta('twitter:description', metadata.description)

    if (metadata.article) {
      setNamedMeta('author', '有解編輯部')
      setPropertyMeta('article:published_time', metadata.article.publishedDate)
      setPropertyMeta('article:modified_time', metadata.article.reviewedDate)
    } else {
      removeNamedMeta('author')
      removePropertyMeta('article:published_time')
      removePropertyMeta('article:modified_time')
    }

    const scriptId = 'seo-structured-data'
    const existingScript = document.getElementById(scriptId)

    if (!isIndexable || metadata.schemaType === undefined) {
      existingScript?.remove()
      return
    }

    const organizationId = `${siteOrigin}/#organization`
    const websiteId = `${siteOrigin}/#website`
    const graph: Array<Record<string, unknown>> = [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: '有解',
        url: `${siteOrigin}/`,
        logo: `${siteOrigin}/favicon.svg`,
        email: 'hello@gangban.hk',
        sameAs: ['https://github.com/openhomek'],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: '有解',
        url: `${siteOrigin}/`,
        inLanguage: 'zh-Hant-HK',
        publisher: { '@id': organizationId },
      },
    ]

    if (metadata.schemaType === 'Article' && metadata.article) {
      const breadcrumbId = `${canonicalUrl}#breadcrumb`

      graph.push(
        {
          '@type': 'Article',
          '@id': `${canonicalUrl}#article`,
          headline: metadata.article.title,
          name: metadata.article.title,
          description: metadata.description,
          url: canonicalUrl,
          mainEntityOfPage: canonicalUrl,
          datePublished: metadata.article.publishedDate,
          dateModified: metadata.article.reviewedDate,
          inLanguage: 'zh-Hant-HK',
          author: { '@id': organizationId },
          publisher: { '@id': organizationId },
          isPartOf: { '@id': websiteId },
          breadcrumb: { '@id': breadcrumbId },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': breadcrumbId,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: '首頁',
              item: `${siteOrigin}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: '新生攻略',
              item: `${siteOrigin}/guides`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: metadata.article.title,
              item: canonicalUrl,
            },
          ],
        },
      )
    } else {
      graph.push({
        '@type': metadata.schemaType,
        '@id': `${canonicalUrl}#webpage`,
        name: metadata.title,
        description: metadata.description,
        url: canonicalUrl,
        inLanguage: 'zh-Hant-HK',
        isPartOf: { '@id': websiteId },
      })

      if (metadata.canonicalPath === '/guides') {
        graph.push({
          '@type': 'ItemList',
          '@id': `${canonicalUrl}#guide-list`,
          name: '香港生活攻略',
          itemListElement: guides.map((guide, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: guide.title,
            url: `${siteOrigin}${guide.path}`,
          })),
        })
      }
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': graph,
    }
    const script = existingScript ?? document.createElement('script')

    script.id = scriptId
    script.setAttribute('type', 'application/ld+json')
    script.textContent = JSON.stringify(structuredData)

    if (existingScript === null) {
      document.head.append(script)
    }
  }, [location.pathname, location.search])

  return null
}

export default SeoMetadata
