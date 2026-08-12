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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Spinner,
} from '@react-monorepo/ui'
import axios from 'axios'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import {
  requestRegistrationCodeRequest,
  verifyRegistrationCodeRequest,
  type RegisterPayload,
} from '../../apis/auth'
import appleIcon from '../../assets/auth/apple.svg'
import eyeIcon from '../../assets/auth/eye.svg'
import googleIcon from '../../assets/auth/google.svg'
import lockIcon from '../../assets/auth/lock.svg'
import logo from '../../assets/logo.svg'
import RegisterShell from '../../components/auth/RegisterShell'
import {
  registrationCodeSchema,
  registrationEmailSchema,
  registrationPasswordSchema,
  type RegistrationCodeFormValues,
  type RegistrationEmailFormValues,
  type RegistrationPasswordFormValues,
} from '../../features/auth/authSchemas'
import {
  clearAuthError,
  registerAccount,
} from '../../features/auth/authSlice'
import {
  useAppDispatch,
  useAppSelector,
} from '../../store/hooks'

type RegistrationStep = 'email' | 'code' | 'password'

const RESEND_WAIT_SECONDS = 60

function getResponseStatus(error: unknown): number | null {
  if (!axios.isAxiosError(error)) {
    return null
  }

  return error.response?.status ?? null
}

function getSendCodeErrorMessage(error: unknown): string {
  const status = getResponseStatus(error)

  if (status === 409) {
    return '此電郵地址已經註冊，請直接登入'
  }

  if (status === 429) {
    return '操作太頻繁，請稍後再試'
  }

  if (status === 400 || status === 422) {
    return '此電郵地址無法接收驗證碼，請檢查後再試'
  }

  return '未能發送驗證碼，請稍後再試'
}

function getVerifyCodeErrorMessage(error: unknown): string {
  const status = getResponseStatus(error)

  if (status === 400 || status === 401 || status === 422) {
    return '驗證碼不正確，請重新輸入'
  }

  if (status === 410) {
    return '驗證碼已過期，請重新發送'
  }

  if (status === 429) {
    return '操作太頻繁，請稍後再試'
  }

  return '未能驗證電郵，請稍後再試'
}

function Register() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [step, setStep] = useState<RegistrationStep>('email')
  const [email, setEmail] = useState('')
  const [registrationToken, setRegistrationToken] = useState('')
  const [requestError, setRequestError] = useState('')
  const [isStepSubmitting, setIsStepSubmitting] = useState(false)
  const [resendSeconds, setResendSeconds] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  const authStatus = useAppSelector((state) => state.auth.status)
  const authErrorMessage = useAppSelector(
    (state) => state.auth.errorMessage,
  )

  const isSubmitting =
    isStepSubmitting || authStatus === 'submitting'

  const emailForm = useForm<RegistrationEmailFormValues>({
    resolver: zodResolver(registrationEmailSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      acceptTerms: false,
    },
  })

  const codeForm = useForm<RegistrationCodeFormValues>({
    resolver: zodResolver(registrationCodeSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      code: '',
    },
  })

  const passwordForm = useForm<RegistrationPasswordFormValues>({
    resolver: zodResolver(registrationPasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  useEffect(() => {
    if (step !== 'code' || resendSeconds <= 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setResendSeconds((currentSeconds) => {
        return Math.max(0, currentSeconds - 1)
      })
    }, 1_000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [resendSeconds, step])

  function clearErrors(): void {
    setRequestError('')

    if (authErrorMessage.length > 0) {
      dispatch(clearAuthError())
    }
  }

  async function handleEmailSubmit(
    values: RegistrationEmailFormValues,
  ): Promise<void> {
    clearErrors()
    setIsStepSubmitting(true)

    try {
      await requestRegistrationCodeRequest({ email: values.email })
      setEmail(values.email)
      setResendSeconds(RESEND_WAIT_SECONDS)
      codeForm.reset({ code: '' })
      setStep('code')
    } catch (error: unknown) {
      setRequestError(getSendCodeErrorMessage(error))
    } finally {
      setIsStepSubmitting(false)
    }
  }

  async function handleCodeSubmit(
    values: RegistrationCodeFormValues,
  ): Promise<void> {
    clearErrors()
    setIsStepSubmitting(true)

    try {
      const verifiedRegistrationToken =
        await verifyRegistrationCodeRequest({
          email,
          code: values.code,
        })

      setRegistrationToken(verifiedRegistrationToken)
      passwordForm.reset()
      setStep('password')
    } catch (error: unknown) {
      setRequestError(getVerifyCodeErrorMessage(error))
    } finally {
      setIsStepSubmitting(false)
    }
  }

  async function handlePasswordSubmit(
    values: RegistrationPasswordFormValues,
  ): Promise<void> {
    clearErrors()

    if (registrationToken.length === 0) {
      setRequestError('驗證資料已失效，請重新輸入驗證碼')
      setStep('code')
      return
    }

    const payload: RegisterPayload = {
      email,
      password: values.password,
      registrationToken,
    }

    const resultAction = await dispatch(registerAccount(payload))

    if (registerAccount.fulfilled.match(resultAction)) {
      navigate('/', { replace: true })
    }
  }

  async function handleResendCode(): Promise<void> {
    if (resendSeconds > 0 || isStepSubmitting) {
      return
    }

    clearErrors()
    setIsStepSubmitting(true)

    try {
      await requestRegistrationCodeRequest({ email })
      setResendSeconds(RESEND_WAIT_SECONDS)
      codeForm.reset({ code: '' })
    } catch (error: unknown) {
      setRequestError(getSendCodeErrorMessage(error))
    } finally {
      setIsStepSubmitting(false)
    }
  }

  const visibleErrorMessage = requestError || authErrorMessage
  const stepNumber = step === 'email' ? 1 : step === 'code' ? 2 : 3

  return (
    <RegisterShell>
      <div className="registration-card min-h-[632px] rounded-2xl border border-[#d7d7d7] bg-white px-8 py-10 sm:px-12">
        <div className="flex items-start justify-between gap-6">
          <img
            src={logo}
            alt="有解"
            className="registration-card-logo h-8 w-auto"
          />
          <span className="pt-1 text-xs font-medium text-[#929292]">
            步驟 {stepNumber} / 3
          </span>
        </div>

        <div className="mt-8">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">
            {step === 'email' && '歡迎加入有解'}
            {step === 'code' && '查看你的電郵'}
            {step === 'password' && '設定你的密碼'}
          </h1>

          {step === 'code' && (
            <p className="mt-3 text-sm leading-6 text-[#6a6a6a]">
              我們已將六位驗證碼傳送至
              <br />
              <strong className="font-medium text-[#222222]">{email}</strong>
            </p>
          )}

          {step === 'password' && (
            <p className="mt-3 text-sm leading-6 text-[#6a6a6a]">
              電郵驗證完成。最後一步，請為帳戶設定密碼。
            </p>
          )}
        </div>

        {visibleErrorMessage.length > 0 && (
          <Alert variant="destructive" className="mt-5">
            <AlertCircle />
            <AlertDescription>{visibleErrorMessage}</AlertDescription>
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
                    <FieldLabel htmlFor="registration-email">
                      電郵地址
                    </FieldLabel>
                    <Input
                      {...field}
                      id="registration-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="輸入你的電郵地址"
                      className="mt-2 h-[62px] rounded-lg border-[#cfcfcf] px-4 text-base shadow-none placeholder:text-[#929292] focus-visible:border-[#222222] focus-visible:ring-1 focus-visible:ring-[#222222]"
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                      onChange={(event) => {
                        field.onChange(event)
                        clearErrors()
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )
              }}
            />

            <Controller
              name="acceptTerms"
              control={emailForm.control}
              render={({ field, fieldState }) => {
                return (
                  <Field
                    className="mt-6"
                    data-invalid={fieldState.invalid}
                  >
                    <div className="flex items-start gap-3 text-sm leading-6 text-[#3f3f3f]">
                      <Checkbox
                        checked={field.value}
                        disabled={isSubmitting}
                        aria-label="同意使用條款及私隱政策"
                        aria-invalid={fieldState.invalid}
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true)
                          clearErrors()
                        }}
                        className="mt-0.5 size-6 rounded-[4px] border-[#555555]"
                      />
                      <p>
                        我同意{' '}
                        <button
                          type="button"
                          disabled
                          aria-label="使用條款（頁面即將上線）"
                          title="使用條款頁面即將上線"
                          className="font-medium text-primary underline underline-offset-2 disabled:opacity-100"
                        >
                          《使用條款》
                        </button>{' '}
                        及{' '}
                        <button
                          type="button"
                          disabled
                          aria-label="私隱政策（頁面即將上線）"
                          title="私隱政策頁面即將上線"
                          className="font-medium text-primary underline underline-offset-2 disabled:opacity-100"
                        >
                          《私隱政策》
                        </button>
                      </p>
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
              className="mt-8 h-14 w-full rounded-lg bg-primary !text-lg !font-medium text-white shadow-none hover:bg-[#e00b41]"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? '正在發送驗證碼' : '繼續'}
            </Button>
          </form>
        )}

        {step === 'code' && (
          <form
            className="mt-8"
            noValidate
            onSubmit={codeForm.handleSubmit(handleCodeSubmit)}
          >
            <Controller
              name="code"
              control={codeForm.control}
              render={({ field, fieldState }) => {
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="registration-code">
                      六位驗證碼
                    </FieldLabel>
                    <InputOTP
                      {...field}
                      id="registration-code"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      aria-label="六位驗證碼"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                      containerClassName="mt-3 justify-between gap-2"
                      onChange={(value) => {
                        field.onChange(value)
                        clearErrors()
                      }}
                    >
                      <InputOTPGroup className="w-full justify-between gap-2">
                        {Array.from({ length: 6 }, (_value, index) => {
                          return (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="h-14 w-full rounded-lg border border-[#cfcfcf] text-xl shadow-none"
                            />
                          )
                        })}
                      </InputOTPGroup>
                    </InputOTP>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )
              }}
            />

            <div className="mt-5 flex items-center justify-between gap-4 text-sm">
              <button
                type="button"
                className="font-medium text-[#3f3f3f] underline underline-offset-4 hover:text-primary"
                onClick={() => {
                  clearErrors()
                  setRegistrationToken('')
                  setStep('email')
                }}
              >
                修改電郵地址
              </button>
              <button
                type="button"
                className="font-medium text-primary disabled:cursor-not-allowed disabled:text-[#929292]"
                disabled={resendSeconds > 0 || isSubmitting}
                onClick={handleResendCode}
              >
                {resendSeconds > 0
                  ? `${resendSeconds} 秒後可重發`
                  : '重新發送驗證碼'}
              </button>
            </div>

            <Button
              type="submit"
              className="mt-8 h-14 w-full rounded-lg bg-primary !text-lg !font-medium text-white shadow-none hover:bg-[#e00b41]"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? '正在驗證' : '驗證並繼續'}
            </Button>
          </form>
        )}

        {step === 'password' && (
          <form
            className="mt-7"
            noValidate
            onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
          >
            <div className="grid gap-4">
              <Controller
                name="password"
                control={passwordForm.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="registration-password">
                        密碼
                      </FieldLabel>
                      <div className="relative mt-2">
                        <img
                          src={lockIcon}
                          alt=""
                          aria-hidden="true"
                          className="pointer-events-none absolute top-1/2 left-4 size-6 -translate-y-1/2"
                        />
                        <Input
                          {...field}
                          id="registration-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="至少 8 位，包含字母及數字"
                          className="h-[62px] rounded-lg border-[#cfcfcf] pr-14 pl-12 text-base shadow-none placeholder:text-[#929292] focus-visible:border-[#222222] focus-visible:ring-1 focus-visible:ring-[#222222]"
                          disabled={isSubmitting}
                          aria-invalid={fieldState.invalid}
                          onChange={(event) => {
                            field.onChange(event)
                            clearErrors()
                          }}
                        />
                        <button
                          type="button"
                          className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center rounded-full hover:bg-[#f7f7f7]"
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

              <Controller
                name="confirmPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="registration-confirm-password">
                        確認密碼
                      </FieldLabel>
                      <Input
                        {...field}
                        id="registration-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="再次輸入密碼"
                        className="mt-2 h-[62px] rounded-lg border-[#cfcfcf] px-4 text-base shadow-none placeholder:text-[#929292] focus-visible:border-[#222222] focus-visible:ring-1 focus-visible:ring-[#222222]"
                        disabled={isSubmitting}
                        aria-invalid={fieldState.invalid}
                        onChange={(event) => {
                          field.onChange(event)
                          clearErrors()
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )
                }}
              />
            </div>

            <button
              type="button"
              className="mt-5 text-sm font-medium text-[#3f3f3f] underline underline-offset-4 hover:text-primary"
              onClick={() => {
                clearErrors()
                setRegistrationToken('')
                setStep('code')
              }}
            >
              返回驗證碼
            </button>

            <Button
              type="submit"
              className="mt-6 h-14 w-full rounded-lg bg-primary !text-lg !font-medium text-white shadow-none hover:bg-[#e00b41]"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? '正在建立帳戶' : '完成註冊'}
            </Button>
          </form>
        )}

        {step === 'email' && (
          <div className="mt-9">
            <div className="flex items-center gap-5 text-[#666666]">
              <span className="h-px flex-1 bg-[#dddddd]" />
              <span className="text-sm">或</span>
              <span className="h-px flex-1 bg-[#dddddd]" />
            </div>

            <div className="mt-6 grid gap-3">
              <Button
                type="button"
                variant="outline"
                disabled
                title="Google 註冊即將推出"
                className="h-12 rounded-lg border-[#777777] bg-white !text-base !font-medium text-[#222222]"
              >
                <img
                  src={googleIcon}
                  alt=""
                  aria-hidden="true"
                  className="size-6"
                />
                使用 Google 繼續
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled
                title="Apple 註冊即將推出"
                className="h-12 rounded-lg border-[#777777] bg-white !text-base !font-medium text-[#222222]"
              >
                <img
                  src={appleIcon}
                  alt=""
                  aria-hidden="true"
                  className="size-6"
                />
                使用 Apple 繼續
              </Button>
            </div>
          </div>
        )}
      </div>
    </RegisterShell>
  )
}

export default Register
