import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import homeIcon from '../../assets/auth/home.svg'
import heroIllustration from '../../assets/auth/registration-community.svg'
import shieldIcon from '../../assets/auth/shield-check.svg'

interface RegisterShellProps {
  children: ReactNode
}

function RegisterShell({ children }: RegisterShellProps) {
  return (
    <div className="registration-page min-h-screen bg-white text-[#222222]">
      <header className="registration-header h-24">
        <div className="mx-auto flex h-full max-w-[1440px] items-center px-6 sm:px-10">
          <Link
            to="/"
            className="ml-auto inline-flex min-h-12 items-center gap-3 text-base font-medium text-[#3f3f3f] transition-colors hover:text-primary"
          >
            <img
              src={homeIcon}
              alt=""
              aria-hidden="true"
              className="size-6"
            />
            <span className="hidden sm:inline">返回首頁</span>
          </Link>
        </div>
      </header>

      <main className="registration-main mx-auto grid min-h-[calc(100dvh-96px)] max-w-[1161px] items-center gap-14 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_480px]">
        <section className="registration-hero hidden min-w-0 lg:block lg:-translate-y-8">
          <div className="max-w-[580px]">
            <h1 className="text-[40px] leading-[1.18] font-semibold tracking-[-0.025em]">
              加入有解，搵到同路人
            </h1>
            <p className="mt-4 text-lg leading-8 text-[#4f4f4f]">
              問生活小事、收藏攻略，同同路人一起適應香港。
            </p>

            <img
              src={heroIllustration}
              alt="建立個人檔案、完成驗證並加入有解社區"
              className="registration-illustration mt-8 ml-5 w-[370px] max-w-full object-contain"
              draggable="false"
            />

            <div className="registration-security mt-4 ml-16 flex items-center gap-3 text-base text-[#3f3f3f]">
              <img
                src={shieldIcon}
                alt=""
                aria-hidden="true"
                className="size-8 brightness-0"
              />
              <span>你的資料只用於保障社區安全</span>
            </div>
          </div>
        </section>

        <section className="registration-panel mx-auto w-full max-w-[480px] lg:-translate-y-[27px]">
          {children}

          <p className="mt-7 text-center text-base text-[#3f3f3f]">
            已有帳戶？{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              登入
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}

export default RegisterShell
