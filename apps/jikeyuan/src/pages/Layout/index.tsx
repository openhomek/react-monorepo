import { Button } from '@react-monorepo/ui'
import { Search } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <header className="border-b border-[#eeeeee]">
        <div className="mx-auto flex h-20 max-w-[1200px] items-center px-6">
          <Link
            to="/"
            className="text-3xl font-bold tracking-[-0.04em] text-primary"
          >
            港伴
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

            <Button variant="outline" className="rounded-full px-6" asChild>
              <Link to="/login">登入</Link>
            </Button>
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