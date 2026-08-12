import { Button, Spinner } from '@react-monorepo/ui'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'

import logo from '../../assets/logo.svg'
import {
  clearAuthError,
  logoutAccount,
} from '../../features/auth/authSlice'
import {
  useAppDispatch,
  useAppSelector,
} from '../../store/hooks'

function Layout() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true)

    await dispatch(logoutAccount())

    setIsLoggingOut(false)
  }

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <header className="border-b border-[#eeeeee]">
        <div className="mx-auto flex h-20 max-w-[1200px] items-center px-6">
          <Link to="/" aria-label="有解" className="inline-flex items-center">
            <img src={logo} alt="有解" className="h-10 w-auto" />
          </Link>

          <nav className="ml-12 hidden items-center gap-9 md:flex">
            <Link className="text-sm font-semibold hover:text-primary" to="/">
              新生攻略
            </Link>

            <Link className="text-sm font-semibold hover:text-primary" to="/">
              生活指南
            </Link>

            <Link className="text-sm font-semibold hover:text-primary" to="/">
              社區
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="搜尋"
            >
              <Search />
            </Button>

            {user === null ? (
              <Button
                variant="outline"
                className="rounded-full px-6"
                asChild
              >
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
              <div className="flex items-center gap-3">
                <span className="hidden text-sm font-medium sm:inline">
                  {user.name}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full px-6"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                >
                  {isLoggingOut && <Spinner />}
                  {isLoggingOut ? '正在登出' : '登出'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Layout 只管理所有页面共享的部分。
          首页、登录页等具体内容交给子路由渲染。 */}
      <Outlet />
    </div>
  )
}

export default Layout
