import { Spinner } from '@react-monorepo/ui'
import { Navigate, Outlet } from 'react-router-dom'

import { useAppSelector } from '../store/hooks'
import SeoMetadata from '../components/seo/SeoMetadata'

function GuestOnly() {
  const authStatus = useAppSelector((state) => state.auth.status)
  const user = useAppSelector((state) => state.auth.user)

  if (authStatus === 'checking') {
    return (
      <>
        <SeoMetadata />
        <main className="grid min-h-screen place-items-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Spinner className="size-5" />
            <span>正在檢查登入狀態</span>
          </div>
        </main>
      </>
    )
  }

  if (user !== null) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <SeoMetadata />
      <Outlet />
    </>
  )
}

export default GuestOnly
