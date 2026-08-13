import { Button } from '@react-monorepo/ui'
import { ArrowRight, ArrowUp } from 'lucide-react'
import { useState } from 'react'
import { FaEnvelope, FaGithub, FaLinkedinIn } from 'react-icons/fa'

import logo from '../../assets/logo.svg'
import openHomeKLogo from '../../assets/partners/openhomek-lockup-horizontal-black.svg'

const exploreLinks = [
  { label: '新生攻略', href: '/#guides' },
  { label: '生活指南', href: '/#categories' },
  { label: '社區論壇', href: '/community' },
  { label: '本週熱門問答', href: '/community' },
  { label: '搜尋社區問題', href: '/community' },
]

const guideLinks = [
  '入境證件',
  '租房住宿',
  '銀行支付',
  '交通出行',
  '電話網絡',
  '校園生活',
]

const legalItems = ['使用條款', '私隱政策', 'Cookie 設定']

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-7 items-center transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </a>
  )
}

function SiteFooter() {
  const [footerNotice, setFooterNotice] = useState('')

  function showComingSoon(label: string): void {
    setFooterNotice(`${label}即將推出`)
  }

  return (
    <footer className="border-t border-[#eeeeee] bg-[#faf9f7] text-[#3f3f3f]">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-2 gap-x-6 gap-y-10 px-6 py-10 lg:min-h-[300px] lg:w-[calc(100%-112px)] lg:grid-cols-[34%_22%_22%_22%] lg:gap-0 lg:px-0 lg:pt-[54px] lg:pb-[22px]">
        <section aria-labelledby="footer-brand-heading" className="col-span-2 lg:col-span-1">
          <h2 id="footer-brand-heading" className="sr-only">
            有解社區
          </h2>
          <img src={logo} alt="有解" className="h-11 w-auto" />
          <p className="mt-6 text-sm leading-6 text-[#333333]">
            陪每個剛到香港的人，少走一點彎路。
          </p>
          <p className="mt-3 text-sm leading-6 text-[#777777]">
            新生攻略・生活指南・社區問答
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-6 h-10 rounded-full border-primary px-7 font-semibold text-primary hover:bg-[#fff0f2] hover:text-primary"
          >
            <a href="/community">
              加入有解社區
              <ArrowRight />
            </a>
          </Button>
        </section>

        <nav aria-labelledby="footer-explore-heading">
          <h2 id="footer-explore-heading" className="text-base font-bold text-[#222222]">
            探索有解
          </h2>
          <ul className="mt-3 space-y-1 text-sm">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-guides-heading">
          <h2 id="footer-guides-heading" className="text-base font-bold text-[#222222]">
            常用指南
          </h2>
          <ul className="mt-3 space-y-1 text-sm">
            {guideLinks.map((label) => (
              <li key={label}>
                <FooterLink href="/#categories">{label}</FooterLink>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="footer-support-heading" className="col-span-2 lg:col-span-1">
          <h2 id="footer-support-heading" className="text-base font-bold text-[#222222]">
            聯絡與支援
          </h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <FooterLink href="/community">社區常見問題</FooterLink>
            </li>
            <li>
              <a
                href="mailto:hello@gangban.hk?subject=內容更正"
                className="inline-flex min-h-7 items-center transition-colors hover:text-primary"
              >
                內容更正
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@gangban.hk?subject=合作聯絡"
                className="inline-flex min-h-7 items-center transition-colors hover:text-primary"
              >
                合作聯絡
              </a>
            </li>
          </ul>
          <a
            href="mailto:hello@gangban.hk"
            className="mt-1 inline-flex min-h-7 items-center text-sm transition-colors hover:text-primary"
          >
            聯絡有解團隊
          </a>
          <p className="mt-1 text-xs leading-5 text-[#858585]">
            一般查詢會在 1–2 個工作天內回覆
          </p>
        </section>
      </div>

      <div className="border-t border-[#dddddd]">
        <div className="relative mx-auto flex min-h-[70px] w-full max-w-[1280px] flex-col gap-5 px-6 py-5 lg:grid lg:w-[calc(100%-112px)] lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-x-8 lg:px-0 lg:py-0">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute -top-[18px] right-6 size-9 rounded-full border-[#d8d8d8] bg-white hover:border-primary hover:bg-white hover:text-primary lg:-right-10"
            aria-label="回到頁面頂部"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowUp />
          </Button>

          <div className="flex gap-6" aria-label="社群媒體">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="size-9 rounded-full border-[#a8a8a8] bg-transparent hover:border-primary hover:bg-[#fff0f2] hover:text-primary [&_svg]:size-5"
            >
              <a
                href="https://github.com/openhomek"
                target="_blank"
                rel="noreferrer"
                aria-label="前往 OpenHomeK GitHub（在新分頁開啟）"
                title="OpenHomeK GitHub"
              >
                <FaGithub />
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9 rounded-full border-[#a8a8a8] bg-transparent hover:border-primary hover:bg-[#fff0f2] hover:text-primary [&_svg]:size-5"
              aria-label="LinkedIn，即將推出"
              title="LinkedIn 即將推出"
              onClick={() => showComingSoon('LinkedIn')}
            >
              <FaLinkedinIn />
            </Button>
            <Button
              asChild
              variant="outline"
              size="icon"
              className="size-9 rounded-full border-[#a8a8a8] bg-transparent hover:border-primary hover:bg-[#fff0f2] hover:text-primary [&_svg]:size-5"
            >
              <a href="mailto:hello@gangban.hk" aria-label="發送 Email 給有解">
                <FaEnvelope />
              </a>
            </Button>
          </div>

          <nav aria-label="法務與 Cookie 設定">
            <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              {legalItems.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="min-h-8 transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    onClick={() => showComingSoon(item)}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-[#555555] lg:justify-self-end">
            <p className="whitespace-nowrap">© 2026 有解社區</p>
            <span className="hidden h-5 w-px bg-[#d8d8d8] lg:block" aria-hidden="true" />
            <div
              className="flex shrink-0 items-center gap-3 whitespace-nowrap"
              aria-label="技術支持：OpenHomeK"
            >
              <span>技術支持</span>
              <img
                src={openHomeKLogo}
                alt="OpenHomeK"
                className="h-6 w-auto lg:h-7"
                loading="lazy"
              />
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            {footerNotice}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
