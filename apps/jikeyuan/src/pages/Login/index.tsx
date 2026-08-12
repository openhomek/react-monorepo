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
import {
  loginEmailSchema,
  loginPasswordSchema,
  type LoginEmailFormValues,
  type LoginPasswordFormValues,
} from '../../features/auth/authSchemas'
import {
  clearAuthError,
  loginAccount,
} from '../../features/auth/authSlice'
import {
  useAppDispatch,
  useAppSelector,
} from '../../store/hooks'

type LoginStep = 'email' | 'password'

function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [step, setStep] = useState<LoginStep>('email')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const authStatus = useAppSelector((state) => state.auth.status)
  const errorMessage = useAppSelector(
    (state) => state.auth.errorMessage,
  )
  const isSubmitting = authStatus === 'submitting'

  const emailForm = useForm<LoginEmailFormValues>({
    resolver: zodResolver(loginEmailSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
    },
  })

  const passwordForm = useForm<LoginPasswordFormValues>({
    resolver: zodResolver(loginPasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      password: '',
      rememberMe: false,
    },
  })

  function clearOldRequestError(): void {
    if (errorMessage.length > 0) {
      dispatch(clearAuthError())
    }
  }

  function handleEmailSubmit(values: LoginEmailFormValues): void {
    clearOldRequestError()
    setEmail(values.email)
    passwordForm.reset({
      password: '',
      rememberMe: passwordForm.getValues('rememberMe'),
    })
    setStep('password')
  }

  async function handlePasswordSubmit(
    values: LoginPasswordFormValues,
  ): Promise<void> {
    const resultAction = await dispatch(
      loginAccount({
        email,
        password: values.password,
        rememberMe: values.rememberMe,
      }),
    )

    if (loginAccount.fulfilled.match(resultAction)) {
      navigate('/', { replace: true })
    }
  }

  function returnToEmail(): void {
    clearOldRequestError()
    passwordForm.reset({
      password: '',
      rememberMe: passwordForm.getValues('rememberMe'),
    })
    setShowPassword(false)
    setStep('email')
  }

  const stepNumber = step === 'email' ? 1 : 2

  return (
    <AuthShell>
      <div className="mt-9 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.025em]">
            {step === 'email' ? '登入' : '輸入密碼'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#666666]">
            {step === 'email'
              ? '使用你的有解帳戶繼續'
              : '完成登入以繼續使用有解'}
          </p>
        </div>

        <span className="mt-1 shrink-0 text-xs font-medium text-[#929292]">
          步驟 {stepNumber} / 2
        </span>
      </div>

      {errorMessage.length > 0 && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {step === 'email' && (
        <form
          className="mt-8"
          noValidate
          onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
        >
          <Controller
            name="email"
            control={emailForm.control}
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-email">
                    電郵地址
                  </FieldLabel>

                  <div className="relative mt-2">
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
                      autoFocus
                      placeholder="輸入你的電郵地址"
                      className="h-14 rounded-lg border-[#d8d8d8] bg-white pr-4 pl-[52px] text-base shadow-none placeholder:text-[#929292] focus-visible:border-[#222222] focus-visible:ring-1 focus-visible:ring-[#222222]"
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

          <Button
            type="submit"
            className="mt-6 h-14 w-full rounded-lg bg-primary !text-base !font-medium text-white shadow-none hover:bg-[#e00b41]"
          >
            下一步
          </Button>
        </form>
      )}

      {step === 'password' && (
        <form
          className="mt-7"
          noValidate
          onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
        >
          <div className="mb-6 flex items-center justify-between gap-4 rounded-lg bg-[#f7f7f7] px-4 py-3">
            <div className="min-w-0">
              <span className="block text-xs text-[#777777]">登入帳戶</span>
              <strong className="mt-0.5 block truncate text-sm font-medium">
                {email}
              </strong>
            </div>
            <button
              type="button"
              className="shrink-0 text-sm font-medium text-primary hover:underline"
              onClick={returnToEmail}
            >
              更改
            </button>
          </div>

          <Controller
            name="password"
            control={passwordForm.control}
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-password">密碼</FieldLabel>

                  <div className="relative mt-2">
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
                      autoFocus
                      placeholder="輸入密碼"
                      className="h-14 rounded-lg border-[#d8d8d8] bg-white pr-[56px] pl-[52px] text-base shadow-none placeholder:text-[#929292] focus-visible:border-[#222222] focus-visible:ring-1 focus-visible:ring-[#222222]"
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                      onChange={(event) => {
                        field.onChange(event)
                        clearOldRequestError()
                      }}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center rounded-full hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]"
                      aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                      aria-pressed={showPassword}
                      onClick={() => {
                        setShowPassword((isVisible) => !isVisible)
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

          <div className="mt-4 flex items-center justify-between gap-4 text-sm text-[#666666]">
            <Controller
              name="rememberMe"
              control={passwordForm.control}
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
              disabled
              title="忘記密碼功能即將推出"
              className="cursor-not-allowed opacity-60"
            >
              忘記密碼？
            </button>
          </div>

          <Button
            type="submit"
            className="mt-6 h-14 w-full rounded-lg bg-primary !text-base !font-medium text-white shadow-none hover:bg-[#e00b41]"
            disabled={isSubmitting}
          >
            {isSubmitting && <Spinner />}
            {isSubmitting ? '正在登入' : '登入'}
          </Button>

          <button
            type="button"
            className="mt-5 w-full text-center text-sm font-medium text-[#555555] hover:text-primary"
            onClick={returnToEmail}
          >
            返回上一步
          </button>
        </form>
      )}
    </AuthShell>
  )
}

export default Login
