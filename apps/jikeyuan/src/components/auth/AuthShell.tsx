import type { ReactNode } from 'react'
import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@react-monorepo/ui'
import { Menu } from 'lucide-react'
import { Link } from 'react-router-dom'

import homeIcon from '../../assets/auth/home.svg'
import heroIllustration from '../../assets/auth/registration-community.svg'
import logo from '../../assets/logo.svg'

type AuthMode = 'login' | 'register'

interface AuthShellProps {
  mode: AuthMode
  title: string
  children: ReactNode
}

function AuthShell({ mode, title, children }: AuthShellProps) {
  const loginTabClassName =
    mode === 'login'
      ? 'bg-primary text-white'
      : 'text-[#222222] hover:bg-[#f7f7f7]'

  const registerTabClassName =
    mode === 'register'
      ? 'bg-primary text-white'
      : 'text-[#222222] hover:bg-[#f7f7f7]'

  return (
    <div className="auth-page min-h-screen bg-white text-[#222222]">
      <header className="auth-header h-20 border-b border-[#ebebeb]">
        <div className="auth-header-inner mx-auto flex h-full max-w-[1200px] items-center px-6">
          <Link
            to="/"
            className="inline-flex shrink-0 items-center"
            aria-label="有解首頁"
          >
            <img
              src={logo}
              alt="有解"
              className="auth-logo h-10 w-auto"
            />
          </Link>

          <nav className="ml-12 hidden items-center gap-9 min-[744px]:flex">
            <Link
              to="/"
              className="text-sm font-semibold transition-colors hover:text-primary"
            >
              新生攻略
            </Link>
            <Link
              to="/"
              className="text-sm font-semibold transition-colors hover:text-primary"
            >
              生活指南
            </Link>
            <Link
              to="/"
              className="text-sm font-semibold transition-colors hover:text-primary"
            >
              社區
            </Link>
          </nav>

          <Link
            to="/"
            className="ml-auto hidden items-center gap-2 text-sm font-medium text-[#3f3f3f] transition-colors hover:text-primary min-[744px]:inline-flex"
          >
            <img
              src={homeIcon}
              alt=""
              aria-hidden="true"
              className="auth-home-icon size-5"
            />
            <span className="hidden sm:inline">返回首頁</span>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className="ml-auto rounded-full min-[744px]:hidden"
                aria-label="開啟導覽選單"
              >
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>

            <SheetContent className="w-[min(86vw,340px)]">
              <SheetHeader className="border-b border-[#ebebeb] p-6">
                <SheetTitle>港伴導覽</SheetTitle>
                <SheetDescription>
                  前往攻略、指南或社區首頁
                </SheetDescription>
              </SheetHeader>

              <nav className="grid gap-2 p-4">
                {['新生攻略', '生活指南', '社區'].map((label) => {
                  return (
                    <SheetClose key={label} asChild>
                      <Link
                        to="/"
                        className="flex min-h-12 items-center rounded-lg px-4 text-base font-medium hover:bg-[#f7f7f7]"
                      >
                        {label}
                      </Link>
                    </SheetClose>
                  )
                })}

                <SheetClose asChild>
                  <Link
                    to="/"
                    className="mt-2 flex min-h-12 items-center gap-3 rounded-lg border border-[#dddddd] px-4 text-base font-medium"
                  >
                    <img
                      src={homeIcon}
                      alt=""
                      aria-hidden="true"
                      className="size-5"
                    />
                    返回首頁
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="auth-main mx-auto grid min-h-[calc(100dvh-80px)] max-w-[1200px] xl:grid-cols-[55%_45%]">
        <section className="auth-hero relative hidden overflow-hidden px-6 pt-12 xl:block">
          <p className="auth-eyebrow text-base font-semibold text-primary">
            給每個剛到香港的人
          </p>

          <h1 className="auth-title mt-4 text-[28px] leading-[1.2] font-semibold tracking-[-0.018em]">
            歡迎返嚟，繼續同行
          </h1>

          <p className="auth-copy mt-4 text-base leading-7 text-[#6a6a6a]">
            有問題就問，有資源就分享，
            <br />
            同一段路上，總有人陪你一起行。
          </p>

          <img
            src={heroIllustration}
            alt="建立個人檔案、完成驗證並加入港伴社區"
            className="auth-illustration mt-[-82px] ml-[-24px] w-[620px] max-w-none object-contain"
            draggable="false"
          />
        </section>

        <section className="auth-panel grid items-center px-5 py-8 sm:px-10 xl:block xl:px-10 xl:pt-10 xl:pb-8">
          <div className="auth-panel-inner mx-auto w-full max-w-[460px] xl:mx-0">
            <div className="auth-tabs grid h-12 grid-cols-2 overflow-hidden rounded-full border border-[#dddddd] p-0">
              <Link
                to="/login"
                className={`grid place-items-center rounded-full text-base font-medium transition-colors ${loginTabClassName}`}
              >
                登入
              </Link>
              <Link
                to="/register"
                className={`grid place-items-center rounded-full text-base font-medium transition-colors ${registerTabClassName}`}
              >
                註冊
              </Link>
            </div>

            <h2 className="auth-panel-title mt-7 text-[28px] leading-tight font-semibold tracking-[-0.018em]">
              {title}
            </h2>

            <div className="auth-panel-content mt-5">{children}</div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AuthShell
