import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import logo from '../../assets/logo.svg'

interface AuthShellProps {
  children: ReactNode
}

function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="login-page grid min-h-dvh place-items-center bg-white px-4 py-8 text-[#222222] sm:px-6">
      <div className="login-stack w-full max-w-[424px]">
        <section className="login-card rounded-[20px] border border-[#e4e4e4] bg-white px-6 py-8 sm:px-10 sm:py-10">
          <Link
            to="/"
            className="inline-flex items-center"
            aria-label="有解首頁"
          >
            <img
              src={logo}
              alt="有解"
              className="login-card-logo h-8 w-auto"
            />
          </Link>

          {children}
        </section>

        <p className="mt-6 text-center text-sm text-[#666666]">
          未有帳戶？{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            建立港伴帳戶
          </Link>
        </p>
      </div>
    </main>
  )
}

export default AuthShell
