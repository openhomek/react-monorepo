import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Spinner,
} from '@react-monorepo/ui'
import { Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

import logo from '../../assets/logo.svg'
import SiteFooter from '../../components/layout/SiteFooter'
import { clearAuthError, logoutAccount } from '../../features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

const navigationItems = [
  { label: '新生攻略', href: '/#guides' },
  { label: '生活指南', href: '/#categories' },
  { label: '社區', href: '/community' },
]

function Layout() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const isOfflineEmpty =
    location.pathname === '/community' &&
    new URLSearchParams(location.search).get('state') === 'offline-empty'

  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true)
    await dispatch(logoutAccount())
    setIsLoggingOut(false)
  }

  function focusQuestionInput(): void {
    const questionInput = document.querySelector<HTMLInputElement>('#question-input')

    questionInput?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => questionInput?.focus(), 350)
  }

  function scrollAfterMenuClose(href: string): void {
    window.setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 220)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#222222]">
      <header className="border-b border-[#eeeeee] bg-white">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-6 min-[744px]:px-8">
          <Link to="/" aria-label="有解首頁" className="inline-flex shrink-0 items-center">
            <img src={logo} alt="有解" className="h-9 w-auto" />
          </Link>

          <nav className="ml-10 hidden items-center gap-9 min-[744px]:flex" aria-label="主要導覽">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                className="inline-flex min-h-12 items-center text-sm font-semibold transition-colors hover:text-primary"
                to={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {!isOfflineEmpty && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 rounded-full"
                aria-label="搜尋或提問"
                onClick={focusQuestionInput}
              >
                <Search />
              </Button>
            )}

            {user === null ? (
              <Button variant="outline" className="hidden h-11 rounded-full px-6 sm:inline-flex" asChild>
                <Link
                  to="/login"
                  onClick={() => {
                    dispatch(clearAuthError())
                  }}
                >
                  登入
                </Link>
              </Button>
            ) : (
              <div className="hidden items-center gap-3 sm:flex">
                <span className="hidden text-sm font-medium min-[900px]:inline">
                  {user.name}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full px-6"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                >
                  {isLoggingOut && <Spinner />}
                  {isLoggingOut ? '正在登出' : '登出'}
                </Button>
              </div>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-11 rounded-full min-[744px]:hidden"
                  aria-label="開啟導覽選單"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[min(86vw,340px)] p-0">
                <SheetHeader className="border-b border-[#eeeeee] px-6 py-6 text-left">
                  <SheetTitle>
                    <img src={logo} alt="有解" className="h-9 w-auto" />
                  </SheetTitle>
                  <SheetDescription>找到攻略，也找到走過同一段路的人。</SheetDescription>
                </SheetHeader>

                <nav className="flex flex-col px-4 py-4" aria-label="手機導覽">
                  {navigationItems.map((item) => (
                    <SheetClose key={item.label} asChild>
                      <Link
                        to={item.href}
                        className="flex min-h-12 items-center rounded-lg px-3 font-semibold transition-colors hover:bg-[#fff7f8] hover:text-primary"
                        onClick={() => {
                          if (item.href.startsWith('/#')) scrollAfterMenuClose(item.href.slice(1))
                        }}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <div className="mt-auto border-t border-[#eeeeee] p-4">
                  {user === null ? (
                    <SheetClose asChild>
                      <Button className="h-12 w-full rounded-full" asChild>
                        <Link
                          to="/login"
                          onClick={() => {
                            dispatch(clearAuthError())
                          }}
                        >
                          登入
                        </Link>
                      </Button>
                    </SheetClose>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-full rounded-full"
                      disabled={isLoggingOut}
                      onClick={handleLogout}
                    >
                      {isLoggingOut && <Spinner />}
                      {isLoggingOut ? '正在登出' : '登出'}
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  )
}

export default Layout
