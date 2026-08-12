import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  AlertDescription,
  Button,
  Checkbox,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Spinner,
} from '@react-monorepo/ui'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import eyeIcon from '../../assets/auth/eye.svg'
import lockIcon from '../../assets/auth/lock.svg'
import mailIcon from '../../assets/auth/mail.svg'
import AuthShell from '../../components/auth/AuthShell'
import SocialAuth from '../../components/auth/SocialAuth'
import {
  loginSchema,
  type LoginFormValues,
} from '../../features/auth/authSchemas'
import {
  clearAuthError,
  loginAccount,
} from '../../features/auth/authSlice'
import {
  useAppDispatch,
  useAppSelector,
} from '../../store/hooks'

function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const authStatus = useAppSelector((state) => state.auth.status)
  const errorMessage = useAppSelector(
    (state) => state.auth.errorMessage,
  )

  const isSubmitting = authStatus === 'submitting'

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  function clearOldRequestError(): void {
    if (errorMessage.length > 0) {
      dispatch(clearAuthError())
    }
  }

  async function handleSubmit(values: LoginFormValues): Promise<void> {
    const resultAction = await dispatch(loginAccount(values))

    if (loginAccount.fulfilled.match(resultAction)) {
      navigate('/', { replace: true })
    }
  }

  return (
    <AuthShell mode="login" title="登入港伴">
      {errorMessage.length > 0 && (
        <Alert variant="destructive" className="mb-5">
          <AlertCircle />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form noValidate onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="auth-login-fields grid gap-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-email" className="sr-only">
                    電郵地址
                  </FieldLabel>

                  <div className="relative">
                    <img
                      src={mailIcon}
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-4 size-6 -translate-y-1/2"
                    />
                    <Input
                      {...field}
                      id="login-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="電郵地址"
                      className="auth-input h-14 rounded-lg border-[#dddddd] bg-white pr-4 pl-[52px] text-base shadow-none placeholder:text-[#6a6a6a] focus-visible:border-[#222222] focus-visible:ring-1 focus-visible:ring-[#222222]"
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                      onChange={(event) => {
                        field.onChange(event)
                        clearOldRequestError()
                      }}
                    />
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )
            }}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-password" className="sr-only">
                    密碼
                  </FieldLabel>

                  <div className="relative">
                    <img
                      src={lockIcon}
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-4 size-6 -translate-y-1/2"
                    />
                    <Input
                      {...field}
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="密碼"
                      className="auth-input h-14 rounded-lg border-[#dddddd] bg-white pr-[56px] pl-[52px] text-base shadow-none placeholder:text-[#6a6a6a] focus-visible:border-[#222222] focus-visible:ring-1 focus-visible:ring-[#222222]"
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                      onChange={(event) => {
                        field.onChange(event)
                        clearOldRequestError()
                      }}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center rounded-full transition-colors hover:bg-[#f7f7f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]"
                      aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                      aria-pressed={showPassword}
                      onClick={() => {
                        setShowPassword(!showPassword)
                      }}
                    >
                      <img
                        src={eyeIcon}
                        alt=""
                        aria-hidden="true"
                        className="size-6"
                      />
                    </button>
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )
            }}
          />
        </div>

        <div className="auth-options mt-4 flex items-center justify-between text-sm text-[#6a6a6a]">
          <Controller
            name="rememberMe"
            control={form.control}
            render={({ field }) => {
              return (
                <label className="flex cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={field.value}
                    disabled={isSubmitting}
                    onCheckedChange={(checked) => {
                      field.onChange(checked === true)
                    }}
                    className="size-6 rounded-[4px] border-[#555555]"
                  />
                  <span>記住我</span>
                </label>
              )
            }}
          />

          <button
            type="button"
            className="cursor-not-allowed rounded-sm opacity-60"
            disabled
            title="忘記密碼功能即將推出"
          >
            忘記密碼？
          </button>
        </div>

        <Button
          type="submit"
          className="auth-primary-button mt-6 h-12 w-full rounded-lg bg-primary !text-base !font-medium text-white shadow-none hover:bg-[#e00b41]"
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? '正在登入' : '登入'}
        </Button>
      </form>

      <SocialAuth
        accountPrompt="未有帳戶？"
        accountAction="立即註冊"
        accountHref="/register"
        providerAction="登入"
      />
    </AuthShell>
  )
}

export default Login
