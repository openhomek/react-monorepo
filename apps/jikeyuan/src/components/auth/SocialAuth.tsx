import { Button } from '@react-monorepo/ui'
import { Link } from 'react-router-dom'

import appleIcon from '../../assets/auth/apple.svg'
import googleIcon from '../../assets/auth/google.svg'
import shieldIcon from '../../assets/auth/shield-check.svg'

interface SocialAuthProps {
  accountPrompt: string
  accountAction: string
  accountHref: string
  providerAction: '登入' | '註冊'
}

function SocialAuth({
  accountPrompt,
  accountAction,
  accountHref,
  providerAction,
}: SocialAuthProps) {
  return (
    <div className="auth-social mt-5">
      <div className="auth-divider flex items-center gap-5 text-[#666666]">
        <span className="h-px flex-1 bg-[#dddddd]" />
        <span className="text-sm">或</span>
        <span className="h-px flex-1 bg-[#dddddd]" />
      </div>

      <div className="auth-social-buttons mt-4 grid gap-2">
        <Button
          type="button"
          variant="outline"
          disabled
          title="Google 登入即將推出"
          className="auth-social-button h-12 rounded-lg border-[#222222] bg-white !text-base !font-medium text-[#222222] hover:bg-[#f7f7f7]"
        >
          <img
            src={googleIcon}
            alt=""
            aria-hidden="true"
            className="size-6"
          />
          使用 Google {providerAction}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled
          title="Apple 登入即將推出"
          className="auth-social-button h-12 rounded-lg border-[#222222] bg-white !text-base !font-medium text-[#222222] hover:bg-[#f7f7f7]"
        >
          <img
            src={appleIcon}
            alt=""
            aria-hidden="true"
            className="size-6"
          />
          使用 Apple {providerAction}
        </Button>
      </div>

      <p className="auth-account mt-5 text-center text-sm text-[#6a6a6a]">
        {accountPrompt}{' '}
        <Link
          to={accountHref}
          className="font-medium text-primary hover:underline"
        >
          {accountAction}
        </Link>
      </p>

      <div className="auth-security mt-6 flex items-center justify-center gap-2 text-sm text-[#6a6a6a]">
        <img
          src={shieldIcon}
          alt=""
          aria-hidden="true"
          className="size-6"
        />
        <span>你的資料只用於保障社區安全</span>
      </div>
    </div>
  )
}

export default SocialAuth
